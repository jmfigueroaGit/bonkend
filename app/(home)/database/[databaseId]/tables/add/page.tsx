'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TableSchema } from '@/lib/db/schemas';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { createTableOnDatabase } from '@/lib/db/actions/database';

const AddPage = () => {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const params = useParams();
	const databaseId = Array.isArray(params.databaseId) ? params.databaseId[0] : params.databaseId;

	const form = useForm<z.infer<typeof TableSchema>>({
		resolver: zodResolver(TableSchema),
		defaultValues: {
			name: '',
			databaseId: databaseId || '',
		},
	});

	const addTable = async (values: z.infer<typeof TableSchema>) => {
		const table = await createTableOnDatabase(values);

		if (table.error) {
			form.reset();
			setError(table.error);
		} else {
			form.reset();
			router.push(`/database/${databaseId}/tables`);
		}
	};

	return (
		<div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
			<Card>
				<CardHeader>
					<CardTitle>Table for Database</CardTitle>
					<CardDescription>Lipsum dolor sit amet, consectetur adipiscing elit</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(addTable)} className='space-y-8'>
							{error && <p className='text-red-500'>{error}</p>}
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder='users' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type='submit'>Save changes</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default AddPage;
