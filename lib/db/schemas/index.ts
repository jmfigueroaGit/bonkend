import { Table } from '@/components/ui/table';
// lib/schemas.ts
import * as z from 'zod';

export const SqlSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }), // Added validation
	databaseType: z.literal('mysql'),
	host: z.string().min(1, { message: 'Host is required' }),
	port: z.coerce.number().min(1, { message: 'Port is required' }),
	database: z.string().min(1, { message: 'Database is required' }),
	user: z.string().min(1, { message: 'User is required' }),
	password: z.string().min(1, { message: 'Password is required' }),
});

export const MongoSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }), // Added validation
	databaseType: z.literal('mongodb'),
	mongoUri: z.string().min(1, { message: 'Mongo URI is required' }),
});

export const TableSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }), // Added validation
	databaseId: z.string(),
});

export const ColumnSchema = z.object({
	name: z.string().min(1, 'Column name is required'),
	dataType: z.string().min(1, 'Data type is required'),
	isPrimaryKey: z.boolean().default(false),
	isUnique: z.boolean().default(false),
	isRequired: z.boolean().default(false),
});

export const TableWithArrayColumnSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	databaseId: z.string(),
	columns: z.array(ColumnSchema),
});
