'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDatabaseList } from '@/lib/db/actions/queries/database';
import { getTablesByDatabaseId } from '@/lib/db/actions/queries/table';
import { Api, Column, Database, Table } from '@prisma/client';
import { Tooltip } from '@radix-ui/react-tooltip';
import { CirclePlus, Code, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PlaygroundPage() {
	const [databases, setDatabases] = useState<Database[]>([]);
	const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [tables, setTables] = useState<(Table & { columns: Column[]; apis: Api[] })[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loadingTables, setLoadingTables] = useState<boolean>(false);
	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const fetchedDatabases = await getDatabaseList();

			if (Array.isArray(fetchedDatabases)) {
				setDatabases(fetchedDatabases);
			} else {
				console.error(fetchedDatabases.error);
			}

			setLoading(false);
		}

		fetchData();
	}, []);

	const handleDatabaseChange = async (databaseId: string | null) => {
		console.log(databaseId);
		setTables([]);
		setLoadingTables(true);
		setSelectedDatabaseId(databaseId);
		const tablesFetch = await getTablesByDatabaseId(databaseId ?? '');

		if (Array.isArray(tablesFetch)) {
			setTables(tablesFetch);
			console.log(tablesFetch);
		} else {
			setError(tablesFetch.error);
		}

		setLoadingTables(false);
	};

	return (
		<TooltipProvider>
			<div className='hidden h-full flex-col md:flex'>
				<div className='container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16'>
					<div className='w-40'>
						<h2 className='text-lg font-semibold'>API Endpoints</h2>
					</div>
					<div className='ml-auto flex w-full space-x-2 sm:justify-end'>
						<Select onValueChange={handleDatabaseChange}>
							<SelectTrigger className='w-[180px]'>
								<SelectValue placeholder='Select a database' />
							</SelectTrigger>
							<SelectContent>
								{!loading && databases.length > 0 ? (
									<SelectGroup>
										{databases.map((database) => (
											<SelectItem key={database.id} value={database.id}>
												{database.name}
											</SelectItem>
										))}
									</SelectGroup>
								) : (
									'No databases found'
								)}
							</SelectContent>
						</Select>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant='outline' size='sm' className='gap-1.5 rounded-full w-10 h-10 bg-transparent'>
									<CirclePlus className='size-3.5 ' />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Add custom API endpoints</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
				<div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
					{loadingTables && (
						<div className='col-span-full flex items-center justify-center'>
							<Loader2 className='animate-spin size-8 text-primary' aria-label='Loading tables' />
						</div>
					)}
					{error && !loadingTables && <p className='text-red-500'>{error}</p>}
					{!loadingTables &&
						tables &&
						tables.length > 0 &&
						tables.map((table) => (
							<Link key={table.id} href={`/projects/${table.id}`}>
								<Card className='cursor-pointer transition-colors duration-200 hover:border-primary border border-opacity-10'>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											{table.name.charAt(0).toUpperCase() + table.name.slice(1)}
										</CardTitle>
										<Code size={20} />
									</CardHeader>
									<CardContent>
										<div className='text-xl font-bold'>+{table.columns.length} columns</div>
										{table.apis.length > 0 &&
											table.apis.map((api) => (
												<Badge key={api.id} variant='outline' className='text-xs text-muted-foreground m-1'>
													{api.method.toUpperCase()}
												</Badge>
											))}
									</CardContent>
								</Card>
							</Link>
						))}
				</div>
			</div>
		</TooltipProvider>
	);
}
