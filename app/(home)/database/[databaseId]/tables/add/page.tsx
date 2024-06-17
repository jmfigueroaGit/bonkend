'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColumnSchema, TableWithArrayColumnSchema } from '@/lib/db/schemas';
import { Loader2, Settings, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createColumnOnTable } from '@/lib/db/actions/queries/table';
import { toast } from 'sonner';
import { Database } from '@prisma/client';
import { getDatabaseById } from '@/lib/db/actions/queries/database';
import { generateApiQueries } from '@/lib/db/actions/queries/api';

const columnsSchema = z.array(ColumnSchema); // Define a schema for an array of columns

const commonDataTypes = [
	'INT',
	'VARCHAR(255)',
	'TEXT',
	'BOOLEAN',
	'DATE',
	'DATETIME',
	'DECIMAL',
	'JSON', // Can be used in MySQL 5.7+
]; // You can add more types here

export default function AddTablePage() {
	const router = useRouter();
	const params = useParams();
	const databaseId = Array.isArray(params.databaseId) ? params.databaseId[0] : params.databaseId;
	const [error, setError] = useState<string | null>(null);
	const [database, setDatabase] = useState<Database | { error: string; status: number } | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const database = await getDatabaseById(databaseId);
				setDatabase(database || null);
			} catch (error) {
				console.error('Error fetching data:', error);
				setError('An unexpected error occurred');
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [databaseId, router]);

	const form = useForm({
		resolver: zodResolver(TableWithArrayColumnSchema),
		defaultValues: {
			name: '',
			databaseId: databaseId || '',
			columns: [{ name: 'id', dataType: 'INT', isPrimaryKey: true, isUnique: true, isRequired: true }], // Initial column
		},
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'columns', // The name of the field array in your form
	});

	const addTable = async (values: z.infer<typeof TableWithArrayColumnSchema>) => {
		try {
			const numPrimaryKeys = values.columns.filter((column) => column.isPrimaryKey).length;
			if (numPrimaryKeys !== 1) {
				throw new Error('Exactly one column must be a primary key.');
			}

			const table = await createColumnOnTable(values);

			if ('data' in table && table.data) {
				form.reset();
				await generateApiQueries(table.data.id);
				toast.success('Table created successfully!');
				router.push(`/database/${databaseId}/tables`);
			} else {
				throw new Error(table.error);
			}
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError('An unknown error occurred.');
			}
		}
	};

	return (
		<div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
			{loading ? (
				<div className='col-span-full flex items-center justify-center'>
					<Loader2 className='animate-spin size-8 text-primary' aria-label='Loading tables' />
				</div>
			) : (
				<Card x-chunk='A card with a form to edit the product details'>
					<CardHeader>
						{database && !('error' in database) && <CardTitle>Table for {database?.name}</CardTitle>}
						<CardDescription>Create a new table for your database</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(addTable)} className='space-y-8'>
								<FormField
									control={form.control}
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Table Name</FormLabel>
											<FormControl>
												<Input placeholder='users' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div>
									{fields.map((field, index) => (
										<div key={field.id} className='flex items-center justify-evenly gap-4 mb-4 '>
											{' '}
											{/* Added flex and gap */}
											<FormField
												control={form.control}
												name={`columns.${index}.name`}
												render={({ field }) => (
													<FormItem className='w-1/3'>
														{' '}
														{/* Adjust width as needed */}
														<FormLabel>Name</FormLabel>
														<FormControl>
															<Input placeholder='name' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name={`columns.${index}.dataType`}
												render={({ field }) => (
													<FormItem className='w-1/3'>
														{' '}
														{/* Adjust width as needed */}
														<FormLabel>Data Type</FormLabel>
														<Select onValueChange={field.onChange} defaultValue={field.value}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder='Select a data type' />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{commonDataTypes.map((type) => (
																	<SelectItem key={type} value={type}>
																		{type}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
											<div className='mt-8'>
												<Popover>
													<PopoverTrigger asChild>
														<div className='relative flex justify-center items-center'>
															<Button
																type='button'
																variant='ghost'
																className='rounded-full w-12 h-12 flex justify-center items-center z-10'
															>
																<Settings className='w-6 h-6' />
															</Button>
														</div>
													</PopoverTrigger>
													<PopoverContent className='w-50'>
														<div className='grid gap-4'>
															<div className='space-y-2'>
																<h5 className='font-sm leading-none'>Extra options</h5>
															</div>
															<div className='grid gap-2'>
																{/* Primary Key Checkbox */}
																<div className='flex items-center gap-2'>
																	<FormField
																		control={form.control}
																		name={`columns.${index}.isPrimaryKey`}
																		render={({ field }) => (
																			<FormItem className='flex items-center space-x-2'>
																				<Checkbox
																					id={`isPrimaryKey-${field.name}`} // Dynamically generated ID
																					checked={field.value}
																					onCheckedChange={(checked) => {
																						// ... (logic for unchecking other primary key checkboxes) ...
																						field.onChange(checked);
																					}}
																				/>
																				<Label htmlFor={`isPrimaryKey-${field.name}`} className='px-2'>
																					Is Primary Key
																				</Label>
																			</FormItem>
																		)}
																	/>
																</div>
																{/* Unique Checkbox */}
																<div className='flex items-center gap-2'>
																	<FormField
																		control={form.control}
																		name={`columns.${index}.isUnique`}
																		render={({ field }) => (
																			<FormItem className='flex items-center space-x-2'>
																				<Checkbox
																					id={`isUnique-${field.name}`} // Dynamically generated ID
																					checked={field.value}
																					onCheckedChange={(checked) => {
																						// ... (logic for unchecking other primary key checkboxes) ...
																						field.onChange(checked);
																					}}
																				/>
																				<Label htmlFor={`isUnique-${field.name}`} className='px-2'>
																					Is Unique
																				</Label>
																			</FormItem>
																		)}
																	/>
																</div>
																{/* Required Checkbox */}
																<div className='flex items-center gap-2'>
																	<FormField
																		control={form.control}
																		name={`columns.${index}.isRequired`}
																		render={({ field }) => (
																			<FormItem className='flex items-center space-x-2'>
																				<Checkbox
																					id={`isRequiredKey-${field.name}`} // Dynamically generated ID
																					checked={field.value}
																					onCheckedChange={(checked) => {
																						// ... (logic for unchecking other primary key checkboxes) ...
																						field.onChange(checked);
																					}}
																				/>
																				<Label htmlFor={`isRequiredKey-${field.name}`} className='px-2'>
																					Is Required
																				</Label>
																			</FormItem>
																		)}
																	/>
																</div>
															</div>
														</div>
													</PopoverContent>
												</Popover>
											</div>
											<Button
												variant='outline'
												size='icon'
												type='button'
												onClick={() => remove(index)}
												className='mt-8'
											>
												<Trash className='h-4 w-4' />
											</Button>
										</div>
									))}
								</div>

								<div className='relative flex justify-center items-center'>
									{' '}
									{/* Add relative positioning to the container */}
									<div className='absolute inset-0 border border-dashed border-gray-300 rounded-lg'></div>{' '}
									{/* Dashed border */}
									<Button
										type='button'
										onClick={() => {
											append({
												name: '',
												dataType: '',
												isPrimaryKey: false,
												isUnique: false,
												isRequired: false,
											});
										}}
										variant='ghost'
										size='lg'
										className='relative z-10 bg-transparent w-full'
									>
										Add Column
									</Button>
								</div>

								{error && <p className='text-red-500'>{error}</p>}
								<div className='flex justify-end '>
									<Button type='submit'>Add Table</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
