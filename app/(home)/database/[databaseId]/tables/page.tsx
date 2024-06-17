'use client';
import { CirclePlus, Loader2, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { deleteTableOnDatabase, getTablesByDatabaseId } from '@/lib/db/actions/queries/table';
import { Column, Database, Table } from '@prisma/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getDatabaseById } from '@/lib/db/actions/queries/database';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export const description =
	'An AI playground with a sidebar navigation and a main content area. The playground has a header with a settings drawer and a share button. The sidebar has navigation links and a user menu. The main content area shows a form to configure the model and messages.';

export const iframeHeight = '740px';

export const containerClassName = 'w-full h-full';

export default function Dashboard() {
	const params = useParams();
	const databaseId = Array.isArray(params.databaseId) ? params.databaseId[0] : params.databaseId;
	const [tables, setTables] = useState<(Table & { columns: Column[] })[]>([]);
	const [database, setDatabase] = useState<Database | { error: string; status: number } | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const [tablesResult, databaseResult] = await Promise.all([
					getTablesByDatabaseId(databaseId),
					getDatabaseById(databaseId),
				]);
				if (Array.isArray(tablesResult)) {
					setTables(tablesResult);
				} else {
					setError(tablesResult.error);
				}
				setDatabase(databaseResult || null);
			} catch (error) {
				console.error('Error fetching data:', error);
				setError('An unexpected error occurred');
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, [databaseId]);

	const handleDeleteTable = async (tableId: string) => {
		const deleteTable = await deleteTableOnDatabase(tableId);
		if (deleteTable && !('error' in deleteTable)) {
			toast.success('Table deleted successfully');
			const tables = await getTablesByDatabaseId(databaseId);
			if (Array.isArray(tables)) {
				setTables(tables);
			} else {
				setError(tables.error);
			}
		} else {
			setError('An unexpected error occurred');
		}
	};

	return (
		<TooltipProvider>
			{database && !('error' in database) && (
				<div className='top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4'>
					<h1 className='text-xl font-semibold'>Tables for {database.name}</h1>

					<Link href={`/database/${databaseId}/tables/add`} className='ml-auto  text-sm'>
						<Button variant='outline' size='sm' className='gap-1.5'>
							<CirclePlus className='size-3.5' />
							Add Table
						</Button>
					</Link>
				</div>
			)}

			<div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3 p-4'>
				{isLoading && (
					<div className='col-span-full flex items-center justify-center'>
						<Loader2 className='animate-spin size-8 text-primary' aria-label='Loading tables' />
					</div>
				)}
				{error && <p>{error}</p>}
				{tables.map((table) => (
					<Link key={table.id} href={`/database/${databaseId}/tables/${table.id}`}>
						<Card className='cursor-pointer transition-colors duration-200 hover:border-primary border border-opacity-10 h-96'>
							<CardHeader>
								<div className='flex justify-between'>
									<div>
										<CardTitle className='truncate w-36'>
											<Tooltip>
												<TooltipTrigger asChild>
													<span>{table.name.charAt(0).toUpperCase() + table.name.slice(1)}</span>
												</TooltipTrigger>
												<TooltipContent>
													<span>{table.name.charAt(0).toUpperCase() + table.name.slice(1)}</span>
												</TooltipContent>
											</Tooltip>
										</CardTitle>

										<CardDescription>
											@{database && !('error' in database) && database.name.toLowerCase()}
										</CardDescription>
									</div>

									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant='outline'
												size='sm'
												className='gap-1.5 rounded-full w-10 h-10 bg-transparent'
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleDeleteTable(table.id);
												}}
											>
												<Trash2 className='size-3.5 ' />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Delete table and columns</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</CardHeader>
							<ScrollArea className='h-72'>
								<CardContent className='grid gap-6 '>
									{table.columns.map((column) => (
										<div key={column.id} className='flex items-center justify-between space-x-4'>
											<div className='flex items-center space-x-4'>
												<Avatar className='h-8 w-8'>
													<AvatarFallback className='text-xs'>
														{column.dataType === 'string' || column.dataType === 'VARCHAR(255)'
															? 'str'
															: column.dataType === 'INT' || column.dataType === 'number'
															? 'int'
															: column.dataType === 'BOOLEAN' || column.dataType === 'bool'
															? 'bool'
															: column.dataType === 'DATE' ||
															  column.dataType === 'date' ||
															  column.dataType === 'DATETIME'
															? 'date'
															: column.dataType === 'DECIMAL' || column.dataType === 'decimal'
															? 'dec...'
															: 'obj'}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className='text-sm font-medium leading-none'>{column.name}</p>
													<p className='text-sm text-muted-foreground'>{column.dataType}</p>
												</div>
											</div>
										</div>
									))}
								</CardContent>
							</ScrollArea>
						</Card>
					</Link>
				))}
			</div>
		</TooltipProvider>
	);
}
