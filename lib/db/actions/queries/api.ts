'use server';
import mysql from 'mysql2/promise';
import { decrypt } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '../..';
import { connectToDatabase } from './database';
import { MongoClient } from 'mongodb';

export async function generateApiQueries(tableId: string) {
	const user = await currentUser();

	if (!user) {
		return {
			error: 'You must be logged in to perform this action',
			status: 401,
		};
	}

	const table = await db.table.findFirst({
		where: {
			id: tableId,
		},
		include: {
			columns: true,
			database: true,
		},
	});

	if (!table) {
		return {
			error: 'Table not found',
			status: 404,
		};
	}

	// Create CRUD API queries for the table
	await Promise.all([
		db.api.create({
			data: {
				name: `Get all ${table.name}`,
				route: `/api/tables/${table.id}/data`,
				method: 'GET',
				tableId: table.id,
			},
		}),

		db.api.create({
			data: {
				name: `Get ${table.name} by ID`,
				route: `/api/tables/${table.id}/data/:id`,
				method: 'GET',
				tableId: table.id,
			},
		}),

		db.api.create({
			data: {
				name: `Create ${table.name}`,
				route: `/api/tables/${table.id}/data`,
				method: 'POST',
				tableId: table.id,
			},
		}),

		db.api.create({
			data: {
				name: `Update ${table.name}`,
				route: `/api/tables/${table.id}/data/:id`,
				method: 'PUT',
				tableId: table.id,
			},
		}),

		db.api.create({
			data: {
				name: `Delete ${table.name}`,
				route: `/api/tables/${table.id}/data/:id`,
				method: 'DELETE',
				tableId: table.id,
			},
		}),
	]);

	return {
		success: true,
		status: 201,
	};
}

// GET all data from a table by ID
export async function getAllData(tableId: string) {
	const user = await currentUser();

	if (!user) {
		return {
			error: 'You must be logged in to perform this action',
			status: 401,
		};
	}

	const table = await db.table.findFirst({
		where: {
			id: tableId,
		},
		include: {
			columns: true,
			database: true,
		},
	});

	if (!table) {
		return {
			error: 'Table not found',
			status: 404,
		};
	}

	const credentials = JSON.parse(table.database.credentials as string);
	const decryptedCredentials =
		table.database.type === 'mysql'
			? decrypt(credentials)
			: decrypt({
					iv: (credentials as { iv: string })?.iv,
					encryptedData: (credentials as { encryptedData: string })?.encryptedData,
			  });

	const testConnection = await connectToDatabase({
		databaseType: table.database.type,
		...decryptedCredentials,
	});

	if (!testConnection) {
		console.log('Connected');
		return { error: 'Error connecting to database', status: 500 };
	}

	if (table.database.type === 'mysql') {
		const connection = await mysql.createConnection(decryptedCredentials);
		const [rows] = await connection.execute(`SELECT * FROM ${table.name}`);
		await connection.end();

		return { rows, column: table.columns, status: 200 };
	} else if (table.database.type === 'mongodb') {
		const client = new MongoClient(decryptedCredentials.mongoUri);
		const databaseName = new URL(decryptedCredentials.mongoUri).pathname.substring(1);
		const db = client.db(databaseName);

		const documents = await db.collection(table.name).find({}).toArray();

		await client.close();

		return { rows: documents, column: table.columns, status: 200 };
	} else {
		return { error: 'Unsupported database type', status: 500 };
	}
}

// GET data from a table by ID
export async function getSingleData(tableId: string, id: string) {
	const user = await currentUser();

	if (!user) {
		return {
			error: 'You must be logged in to perform this action',
			status: 401,
		};
	}

	const table = await db.table.findFirst({
		where: {
			id: tableId,
		},
		include: {
			columns: true,
			database: true,
		},
	});

	if (!table) {
		return {
			error: 'Table not found',
			status: 404,
		};
	}

	const credentials = JSON.parse(table.database.credentials as string);
	const decryptedCredentials =
		table.database.type === 'mysql'
			? decrypt(credentials)
			: decrypt({
					iv: (credentials as { iv: string })?.iv,
					encryptedData: (credentials as { encryptedData: string })?.encryptedData,
			  });

	const testConnection = await connectToDatabase({
		databaseType: table.database.type,
		...decryptedCredentials,
	});

	if (!testConnection) {
		return { error: 'Error connecting to database', status: 500 };
	}

	if (table.database.type === 'mysql') {
		const connection = await mysql.createConnection(decryptedCredentials);
		const [rows] = await connection.execute(`SELECT * FROM ${table.name} WHERE id = ?`, [id]);
		await connection.end();
		return { rows, column: table.columns, status: 200 };
	} else if (table.database.type === 'mongodb') {
		const client = new MongoClient(decryptedCredentials.mongoUri);
		const databaseName = new URL(decryptedCredentials.mongoUri).pathname.substring(1);
		const db = client.db(databaseName);

		const document = await db.collection(table.name).findOne({ id });
		await client.close();

		return { rows: document, column: table.columns, status: 200 };
	} else {
		return { error: 'Unsupported database type', status: 500 };
	}
}

// POST data to a table by ID
export async function createData(tableId: string, data: any) {
	const user = await currentUser();

	if (!user) {
		return {
			error: 'You must be logged in to perform this action',
			status: 401,
		};
	}

	const table = await db.table.findFirst({
		where: {
			id: tableId,
		},
		include: {
			columns: true,
			database: true,
		},
	});

	if (!table) {
		return {
			error: 'Table not found',
			status: 404,
		};
	}

	const credentials = JSON.parse(table.database.credentials as string);
	const decryptedCredentials =
		table.database.type === 'mysql'
			? decrypt(credentials)
			: decrypt({
					iv: (credentials as { iv: string })?.iv,
					encryptedData: (credentials as { encryptedData: string })?.encryptedData,
			  });

	const testConnection = await connectToDatabase({
		databaseType: table.database.type,
		...decryptedCredentials,
	});

	if (!testConnection) {
		return { error: 'Error connecting to database', status: 500 };
	}

	if (table.database.type === 'mysql') {
		const connection = await mysql.createConnection(decryptedCredentials);
		const [rows] = await connection.execute(`INSERT INTO ${table.name} SET ?`, data);
		await connection.end();
		return { rows, column: table.columns, status: 200 };
	} else if (table.database.type === 'mongodb') {
		const client = new MongoClient(decryptedCredentials.mongoUri);
		const databaseName = new URL(decryptedCredentials.mongoUri).pathname.substring(1);
		const db = client.db(databaseName);

		const document = await db.collection(table.name).insertOne(data);
		await client.close();

		return { rows: document, column: table.columns, status: 200 };
	} else {
		return { error: 'Unsupported database type', status: 500 };
	}
}

// PUT data to a table by ID
export async function updateData(tableId: string, id: string, data: any) {
	const user = await currentUser();

	if (!user) {
		return {
			error: 'You must be logged in to perform this action',
			status: 401,
		};
	}

	const table = await db.table.findFirst({
		where: {
			id: tableId,
		},
		include: {
			columns: true,
			database: true,
		},
	});

	if (!table) {
		return {
			error: 'Table not found',
			status: 404,
		};
	}

	const credentials = JSON.parse(table.database.credentials as string);
	const decryptedCredentials =
		table.database.type === 'mysql'
			? decrypt(credentials)
			: decrypt({
					iv: (credentials as { iv: string })?.iv,
					encryptedData: (credentials as { encryptedData: string })?.encryptedData,
			  });

	const testConnection = await connectToDatabase({
		databaseType: table.database.type,
		...decryptedCredentials,
	});

	if (!testConnection) {
		return { error: 'Error connecting to database', status: 500 };
	}

	if (table.database.type === 'mysql') {
		const connection = await mysql.createConnection(decryptedCredentials);
		const [rows] = await connection.execute(`UPDATE ${table.name} SET ? WHERE id = ?`, [data, id]);
		await connection.end();
		return { rows, column: table.columns, status: 200 };
	} else if (table.database.type === 'mongodb') {
		const client = new MongoClient(decryptedCredentials.mongoUri);
		const databaseName = new URL(decryptedCredentials.mongoUri).pathname.substring(1);
		const db = client.db(databaseName);

		const document = await db.collection(table.name).updateOne({ id }, { $set: data });
		await client.close();

		return { rows: document, column: table.columns, status: 200 };
	} else {
		return { error: 'Unsupported database type', status: 500 };
	}
}

// DELETE data from a table by ID
export async function deleteData(tableId: string, id: string) {
	const user = await currentUser();

	if (!user) {
		return {
			error: 'You must be logged in to perform this action',
			status: 401,
		};
	}

	const table = await db.table.findFirst({
		where: {
			id: tableId,
		},
		include: {
			columns: true,
			database: true,
		},
	});

	if (!table) {
		return {
			error: 'Table not found',
			status: 404,
		};
	}

	const credentials = JSON.parse(table.database.credentials as string);
	const decryptedCredentials =
		table.database.type === 'mysql'
			? decrypt(credentials)
			: decrypt({
					iv: (credentials as { iv: string })?.iv,
					encryptedData: (credentials as { encryptedData: string })?.encryptedData,
			  });

	const testConnection = await connectToDatabase({
		databaseType: table.database.type,
		...decryptedCredentials,
	});

	if (!testConnection) {
		return { error: 'Error connecting to database', status: 500 };
	}

	if (table.database.type === 'mysql') {
		const connection = await mysql.createConnection(decryptedCredentials);
		const [rows] = await connection.execute(`DELETE FROM ${table.name} WHERE id = ?`, [id]);
		await connection.end();
		return { rows, column: table.columns, status: 200 };
	} else if (table.database.type === 'mongodb') {
		const client = new MongoClient(decryptedCredentials.mongoUri);
		const databaseName = new URL(decryptedCredentials.mongoUri).pathname.substring(1);
		const db = client.db(databaseName);

		const document = await db.collection(table.name).deleteOne({ id });
		await client.close();

		return { rows: document, column: table.columns, status: 200 };
	} else {
		return { error: 'Unsupported database type', status: 500 };
	}
}
