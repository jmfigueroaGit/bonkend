'use server';

import { SqlSchema, MongoSchema, TableSchema } from '@/lib/db/schemas';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { encrypt, decrypt } from '@/lib/utils';
import * as z from 'zod';
import mysql from 'mysql2/promise'; // Use promise version
import { MongoClient } from 'mongodb';

export async function connectToDatabase(values: Record<string, any>) {
	const { databaseType, ...credentials } = values;
	try {
		if (databaseType === 'mysql') {
			const { host, port, database, user, password } = credentials;
			const connection = await mysql.createConnection({
				host,
				port,
				user,
				password,
				database,
			});
			await connection.end();
			return true;
		} else if (databaseType === 'mongodb') {
			const client = new MongoClient(credentials.mongoUri);
			await client.connect();
			await client.db().admin().listDatabases();
			await client.close();
			return true;
		} else return false;
	} catch (error) {
		throw error;
	}
}

export async function saveCredentials(credentials: z.infer<typeof SqlSchema> | z.infer<typeof MongoSchema>) {
	const user = await currentUser();

	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	// Encrypt credentials before storing (now as a string)
	const encryptedCredentials =
		credentials.databaseType === 'mysql'
			? encrypt(
					JSON.stringify({
						host: credentials.host,
						port: credentials.port,
						database: credentials.database,
						user: credentials.user,
						password: credentials.password,
					})
			  )
			: encrypt(JSON.stringify({ mongoUri: credentials.mongoUri }));

	// Save the encrypted credentials to the database
	const response = await db.database.create({
		data: {
			userId: user.id,
			credentials: JSON.stringify(encryptedCredentials),
			type: credentials.databaseType,
		},
	});

	return response;
}

export async function getDatabaseList() {
	const user = await currentUser();

	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	let databases = await db.database.findMany({
		where: { userId: user.id },
	});

	const decryptedCredentials = databases.map((database) => {
		let parsedCredentials = {};

		try {
			parsedCredentials = JSON.parse(database.credentials as string);
		} catch (error) {
			console.error('Error parsing credentials:', error);
		}

		database = {
			...database,
			credentials: parsedCredentials,
		};

		const decryptedCredentials =
			database.type === 'mysql'
				? decrypt(parsedCredentials)
				: decrypt({
						iv: (parsedCredentials as { iv: string })?.iv,
						encryptedData: (parsedCredentials as { encryptedData: string })?.encryptedData,
				  });

		return {
			...database,
			credentials: decryptedCredentials,
		};
	});

	return decryptedCredentials;
}

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
