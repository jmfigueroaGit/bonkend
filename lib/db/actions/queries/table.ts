'use server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '../..';

export const getTablesByDatabaseId = async (databaseId: string) => {
	const user = await currentUser();

	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	const database = await db.database.findFirst({
		where: { id: databaseId, userId: user.id },
	});

	if (!database) {
		return { error: 'Database not found', status: 404 };
	}

	const tables = await db.table.findMany({
		where: { databaseId },
	});

	return tables;
};
