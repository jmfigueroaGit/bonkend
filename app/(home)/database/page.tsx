'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteDatabaseById, getDatabaseList } from '@/lib/db/actions/queries/database';
import { Database } from '@prisma/client';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function Page() {
	const [databases, setDatabases] = useState<Database[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const router = useRouter();

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const fetchedDatabases = await getDatabaseList();

			if (Array.isArray(fetchedDatabases)) {
				setDatabases(fetchedDatabases);
			} else {
				// Handle the error here, maybe set an error state or display a message
				console.error(fetchedDatabases.error); // Assuming the error is formatted consistently
			}

			setLoading(false);
		}

		fetchData();
	}, []);

	const handleDeleteDatabase = async (databaseId: string) => {
		const deleteDatabase = await deleteDatabaseById(databaseId);
		if (deleteDatabase && !('error' in deleteDatabase)) {
			toast.success('Database deleted successfully');
			const databases = await getDatabaseList();
			if (Array.isArray(databases)) {
				setDatabases(databases);
			} else {
				toast.error(databases.error);
				// Handle the error here, maybe set an error state or display a message
				console.error(databases.error); // Assuming the error is formatted consistently
			}
		} else {
			// Handle the error here, maybe set an error state or display a message
			toast.error(deleteDatabase.error);
			console.error(deleteDatabase.error); // Assuming the error is formatted consistently
		}
	};

	return (
		<div className='h-full'>
			<Card x-chunk='A table of recent orders showing the following columns: Customer, Type, Status, Date, and Amount.'>
				<CardHeader className='w-100 flex flex-row items-center justify-between'>
					<div>
						<CardTitle>Database</CardTitle>
						<CardDescription>Here is a list of your database records.</CardDescription>
					</div>

					<div>
						<Link href='/database/add'>
							<Button className='mt-4'>Add Database</Button>
						</Link>
					</div>
				</CardHeader>
				{loading && (
					<div className='w-full flex items-center justify-center py-12'>
						<Loader2 className='animate-spin size-8 text-primary' aria-label='Loading tables' />
					</div>
				)}
				{!loading && databases.length !== 0 && (
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='hidden sm:table-cell'>Name</TableHead>
									<TableHead className='hidden sm:table-cell'>Type</TableHead>
									<TableHead className='hidden sm:table-cell'>Status</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{databases.map((database) => (
									<TableRow key={database.id}>
										<TableCell className='hidden sm:table-cell'>{database.name}</TableCell>

										<TableCell className='hidden sm:table-cell'>
											<Badge variant='outline'>{database.type === 'mongodb' ? 'MongoDB' : 'MySQL'}</Badge>
										</TableCell>
										<TableCell className='hidden sm:table-cell'>
											<Badge variant={`${database.type === 'mysql' ? 'secondary' : 'destructive'}`}>
												{database.type ? 'Active' : 'Inactive'}
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant='ghost'>
														<Ellipsis className='w-6 h-6' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent className='w-56'>
													<DropdownMenuCheckboxItem>
														<Link href={`/database/${database.id}/tables`}>View Tables </Link>
													</DropdownMenuCheckboxItem>
													<DropdownMenuCheckboxItem>
														<Link href={`/database/${database.id}/edit`}>Edit Database </Link>
													</DropdownMenuCheckboxItem>
													<DropdownMenuCheckboxItem onClick={() => handleDeleteDatabase(database.id)}>
														Delete Database
													</DropdownMenuCheckboxItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				)}
			</Card>
		</div>
	);
}
