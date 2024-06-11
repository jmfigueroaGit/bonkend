// app/api/database/test/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise'; // Use promise version
import { MongoClient } from 'mongodb';

// ... (Replace with your actual database connection logic)
const connectToDatabase = async (type: string, credentials: any) => {
	try {
		if (type === 'mysql') {
			const { host, port, database, user, password } = credentials;
			const connection = await mysql.createConnection({
				host,
				port,
				user,
				password,
				database,
			});
			// Close connection immediately after test
			await connection.end();
			return true;
		} else if (type === 'mongodb') {
			const client = new MongoClient(credentials.uri);
			await client.connect();
			await client.db().admin().listDatabases(); // Test by listing databases
			await client.close();
			return true;
		} else return false;
	} catch (error) {
		throw error; // Rethrow error for handling in the API route
	}
};

export async function POST(req: Request) {
	const { databaseType, ...credentials } = await req.json();

	try {
		const connected = await connectToDatabase(databaseType, credentials);
		if (connected) {
			return NextResponse.json({ status: 'success' });
		} else {
			return NextResponse.json({
				status: 'error',
				message: 'Invalid credentials or unsupported database type',
			});
		}
	} catch (error) {
		return NextResponse.json({
			status: 'error',
			message: error instanceof Error ? error.message : 'Connection failed',
		});
	}
}
