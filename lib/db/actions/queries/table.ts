'use server';

import { currentUser } from '@clerk/nextjs/server';
import mysql from 'mysql2/promise';
import { decrypt } from '@/lib/utils';
import * as z from 'zod';
import { MongoClient } from 'mongodb';
import { db } from '../..';

import { TableSchema, TableWithArrayColumnSchema } from '@/lib/db/schemas';
import { connectToDatabase } from './database';
import { Column, Table } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// lib/constants.ts
const mongoDbDataTypes: { [key: string]: string } = {
	INT: 'number',
	'VARCHAR(255)': 'string',
	TEXT: 'string',
	BOOLEAN: 'bool', // Change to bool
	DATE: 'date',
	DATETIME: 'date',
	DECIMAL: 'decimal', // Could be 'double' for less precision
	JSON: 'object',
};

export const getTablesByDatabaseId = async (databaseId: string) => {
	const user = await currentUser();

	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	const database = await db.database.findFirst({
		where: { id: databaseId, userId: user.id },
		include: {
			tables: {
				include: {
					columns: true,
					apis: true,
				},
			},
		},
	});

	if (!database) {
		return { error: 'Database not found', status: 404 };
	}

	return database.tables;
};

export async function createTableOnDatabase(values: z.infer<typeof TableSchema>) {
	const user = await currentUser();

	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	const parsedValues = TableSchema.safeParse(values);

	if (!parsedValues.success) {
		return { error: 'Invalid values', status: 400 };
	}

	const database = await db.database.findFirst({
		where: { id: values.databaseId, userId: user.id },
	});

	if (!database) {
		return { error: 'Database not found', status: 404 };
	}

	const credentials = JSON.parse(database.credentials as string);
	const decryptedCredentials =
		database.type === 'mysql'
			? decrypt(credentials)
			: decrypt({
					iv: (credentials as { iv: string })?.iv,
					encryptedData: (credentials as { encryptedData: string })?.encryptedData,
			  });

	const testConnection = await connectToDatabase({
		databaseType: database.type,
		...decryptedCredentials,
	});

	if (!testConnection) {
		console.log('Connected');
		return { error: 'Error connecting to database', status: 500 };
	}

	try {
		if (database.type === 'mysql') {
			const connection = await mysql.createConnection({
				host: decryptedCredentials.host,
				port: decryptedCredentials.port,
				user: decryptedCredentials.user,
				password: decryptedCredentials.password,
				database: decryptedCredentials.database,
			});
			// Check if table exists in MySQL
			const [existingTables] = await connection.execute(`SHOW TABLES LIKE '${values.name}'`);
			if (Array.isArray(existingTables) && existingTables.length > 0) {
				await connection.end(); // Close connection even if table exists
				return { error: 'Table already exists', status: 400 };
			}

			await connection.query(`CREATE TABLE ${values.name} (id INT AUTO_INCREMENT PRIMARY KEY)`);
			await connection.end();
		} else if (database.type === 'mongodb') {
			const client = new MongoClient(decryptedCredentials.mongoUri);
			await client.connect();
			const db = client.db(decryptedCredentials.database);

			// Check if collection exists in MongoDB
			const collections = await db.listCollections({ name: values.name }).toArray();
			if (collections.length > 0) {
				await client.close(); // Close connection even if collection exists
				return { error: 'Collection already exists', status: 400 };
			}

			await db.createCollection(values.name);
			await client.close();
		} else {
			return { error: 'Invalid database type', status: 400 };
		}

		const data = await db.table.create({
			data: {
				name: values.name,
				databaseId: values.databaseId,
			},
		});

		return { data, status: 201 };
	} catch (error) {
		console.error('Error creating table:', error);
		return { error: 'Error creating table', status: 500 };
	}
}

export async function createColumnOnTable(values: z.infer<typeof TableWithArrayColumnSchema>) {
	const user = await currentUser();
	const columns = JSON.stringify(values.columns);

	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	const parsed = TableWithArrayColumnSchema.safeParse(values);

	if (!parsed.success) {
		return { error: 'Invalid values', status: 400 };
	}

	const database = await db.database.findFirst({
		where: { id: values.databaseId, userId: user.id },
	});

	if (!database) {
		return { error: 'Database not found', status: 404 };
	}

	const credentials = JSON.parse(database.credentials as string);
	const decryptedCredentials =
		database.type === 'mysql'
			? decrypt(credentials)
			: decrypt({
					iv: (credentials as { iv: string })?.iv,
					encryptedData: (credentials as { encryptedData: string })?.encryptedData,
			  });

	const testConnection = await connectToDatabase({
		databaseType: database.type,
		...decryptedCredentials,
	});

	if (!testConnection) {
		console.log('Connected');
		return { error: 'Error connecting to database', status: 500 };
	}

	let parsedColumns: Column[] = JSON.parse(columns);

	try {
		let table: any = null;

		if (database.type === 'mysql') {
			const connection = await mysql.createConnection(decryptedCredentials); // Connect to MySQL

			// Check if table exists
			const [existingTables] = await connection.execute(`SHOW TABLES LIKE '${values.name}'`);

			if (Array.isArray(existingTables) && existingTables.length > 0) {
				await connection.end(); // Close connection even if table exists
				return { error: 'Table already exists', status: 400 };
			}

			// Build the CREATE TABLE query with the columns
			const columnDefinitions = parsedColumns
				.map((column) => {
					const constraints = [];
					if (column.isPrimaryKey) {
						constraints.push('PRIMARY KEY');
					}
					if (column.isUnique) {
						constraints.push('UNIQUE');
					}
					if (column.isRequired) {
						constraints.push('NOT NULL');
					}

					return `${column.name} ${column.dataType} ${constraints.join(' ')}`;
				})
				.join(', ');

			const createTableQuery = `CREATE TABLE ${values.name} (${columnDefinitions})`;

			console.log('createTableQuery:', createTableQuery);
			await connection.execute(createTableQuery);
			await connection.end();
		} else if (database.type === 'mongodb') {
			// MongoDB collection creation login (modified)
			const client = new MongoClient(decryptedCredentials.mongoUri);
			const databaseName = new URL(decryptedCredentials.mongoUri).pathname.substring(1);
			const db = client.db(databaseName);
			const collectionName = values.name;

			// Check if collection exists in MongoDB
			const collections = await db.listCollections({ name: collectionName }).toArray();
			if (collections.length > 0) {
				await client.close(); // Close connection even if collection exists
				return { error: 'Collection already exists', status: 400 };
			}

			// Create collection and add validator (if columns are provided)
			const validator =
				columns.length > 0
					? {
							$jsonSchema: {
								bsonType: 'object',
								// Improved handling of required fields
								required: parsedColumns
									.filter((col) => col.isRequired && col.name !== '_id') // Exclude _id
									.map((col) => col.name),

								// Dynamically build properties based on column definitions
								properties: Object.fromEntries(
									parsedColumns.map((col) => {
										const properties: { [key: string]: any } = {
											bsonType: mongoDbDataTypes[col.dataType],
										};
										if (col.isUnique) properties.uniqueItems = true;
										if (col.dataType.startsWith('VARCHAR')) {
											const maxLength = parseInt(col.dataType.match(/\d+/)?.[0] || '', 10);
											if (maxLength) properties.maxLength = maxLength;
										}
										return [col.name, properties];
									})
								),
							},
					  }
					: undefined;

			await db.createCollection(collectionName, { validator, validationAction: 'error', validationLevel: 'moderate' });

			await client.close();
		} else {
			return { error: 'Invalid database type', status: 400 };
		}

		// Create the table in the database
		table = await db.table.create({
			data: {
				name: parsed.data.name,
				databaseId: parsed.data.databaseId,
				// Pass the column data with tableId for MySQL
				columns: {
					create: parsedColumns.map((column) => ({
						name: column.name,
						dataType: database.type === 'mongodb' ? mongoDbDataTypes[column.dataType] : column.dataType,
						isRequired: column.isRequired,
						isUnique: column.isUnique,
						isPrimaryKey: column.isPrimaryKey,
					})),
				},
			},
			include: {
				columns: true, // Include columns in the result
			},
		});

		return { data: table, status: 201 };
	} catch (error) {
		console.error('Error creating table:', error);
		return { error: 'Error creating table', status: 500 };
	}
}

export async function deleteTableOnDatabase(tableId: string) {
	const user = await currentUser();

	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	const table = await db.table.findFirst({
		where: { id: tableId },
		include: { database: true },
	});

	if (!table || table.database.userId !== user.id) {
		return { error: 'Table not found', status: 404 };
	}

	const database = await db.database.findFirst({
		where: { id: table.databaseId, userId: user.id },
	});

	if (!database) {
		return { error: 'Database not found', status: 404 };
	}

	const credentials = JSON.parse(database.credentials as string);
	const decryptedCredentials =
		database.type === 'mysql'
			? decrypt(credentials)
			: decrypt({
					iv: (credentials as { iv: string })?.iv,
					encryptedData: (credentials as { encryptedData: string })?.encryptedData,
			  });

	const testConnection = await connectToDatabase({
		databaseType: database.type,
		...decryptedCredentials,
	});

	if (!testConnection) {
		console.log('Connected');
		return { error: 'Error connecting to database', status: 500 };
	}

	try {
		if (database.type === 'mysql') {
			const connection = await mysql.createConnection(decryptedCredentials);
			await connection.execute(`DROP TABLE ${table.name}`);
			await connection.end();
		} else if (database.type === 'mongodb') {
			const client = new MongoClient(decryptedCredentials.mongoUri);
			await client.connect();
			const db = client.db(decryptedCredentials.database);
			await db.collection(table.name).drop();
			await client.close();
		} else {
			return { error: 'Invalid database type', status: 400 };
		}

		await db.table.delete({ where: { id: tableId } });

		revalidatePath(`/database/${table.databaseId}/tables`);

		return { message: 'Table deleted successfull', status: 204 };
	} catch (error) {
		console.error('Error deleting table:', error);
		return { error: 'Error deleting table', status: 500 };
	}
}

export async function getTableById(tableId: string) {
	const user = await currentUser();

	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	const table = await db.table.findFirst({
		where: { id: tableId },
		include: { columns: true, database: true, apis: true },
	});

	if (!table) {
		return { error: 'Table not found', status: 404 };
	}

	return table;
}
