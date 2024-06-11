// lib/schemas.ts
import * as z from 'zod';

export const SqlSchema = z.object({
	databaseType: z.literal('mysql'),
	host: z.string(),
	port: z.coerce.number(),
	database: z.string(),
	user: z.string(),
	password: z.string(),
});

export const MongoSchema = z.object({
	databaseType: z.literal('mongodb'),
	uri: z.string(),
});
