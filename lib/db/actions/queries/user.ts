// lib/queries.ts
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function createUserIfNotExists() {
	const user = await currentUser();

	if (!user) {
		throw new Error('User not found.');
	}

	const existingUser = await db.user.findUnique({
		where: { id: user.id },
	});

	if (!existingUser) {
		return await db.user.create({
			data: {
				id: user.id,
				email: user.emailAddresses[0].emailAddress,
				// Add other relevant fields from the user object if needed
			},
		});
	}

	return existingUser; // User already exists
}

export async function getAuthUserDetails() {
	const user = await currentUser();

	if (!user) {
		throw new Error('User not found.');
	}

	return await db.user.findUnique({
		where: { id: user.id },
	});
}
