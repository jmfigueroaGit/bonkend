'use client';
import { Bird, CirclePlus, Loader2, Rabbit, Settings, Turtle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getTablesByDatabaseId } from '@/lib/db/actions/queries/table';
import { Table } from '@prisma/client';
import { useEffect, useState } from 'react';

export const description =
	'An AI playground with a sidebar navigation and a main content area. The playground has a header with a settings drawer and a share button. The sidebar has navigation links and a user menu. The main content area shows a form to configure the model and messages.';

export const iframeHeight = '740px';

export const containerClassName = 'w-full h-full';

export default function Dashboard() {
	const params = useParams();
	const databaseId = Array.isArray(params.databaseId) ? params.databaseId[0] : params.databaseId;
	const [tables, setTables] = useState<Table[]>([]); // State to store fetched tables
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getTablesByDatabaseId(databaseId);

				if (Array.isArray(result)) {
					setTables(result);
				} else {
					setError(result.error);
				}
			} catch (err) {
				console.error('Error fetching tables:', err);
				setError('An unexpected error occurred');
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, [databaseId]);

	return (
		<TooltipProvider>
			<div className='top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4'>
				<h1 className='text-xl font-semibold'>Tables for Database</h1>

				<Link href={`/database/${databaseId}/tables/add`} className='ml-auto  text-sm'>
					<Button variant='outline' size='sm' className='gap-1.5'>
						<CirclePlus className='size-3.5' />
						Add Table
					</Button>
				</Link>
			</div>
			<div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3 p-4'>
				{isLoading && (
					<div className='col-span-full flex items-center justify-center'>
						<Loader2 className='animate-spin size-8 text-primary' aria-label='Loading tables' />
					</div>
				)}
				{error && <p>{error}</p>}
				{tables.map((table) => (
					<Card key={table.id}>
						<CardHeader>
							<CardTitle>{table.name.charAt(0).toUpperCase() + table.name.slice(1)}</CardTitle>
							<CardDescription>@database-name</CardDescription>
						</CardHeader>
						<CardContent className='grid gap-6'>
							<div className='flex items-center justify-between space-x-4'>
								<div className='flex items-center space-x-4'>
									<Avatar className='h-8 w-8'>
										<AvatarFallback>OM</AvatarFallback>
									</Avatar>
									<div>
										<p className='text-sm font-medium leading-none'>userId</p>
										<p className='text-sm text-muted-foreground'>@primary</p>
									</div>
								</div>
							</div>
							<div className='flex items-center justify-between space-x-4'>
								<div className='flex items-center space-x-4'>
									<Avatar className='h-8 w-8'>
										<AvatarFallback>JL</AvatarFallback>
									</Avatar>
									<div>
										<p className='text-sm font-medium leading-none'>username</p>
										<p className='text-sm text-muted-foreground'>@string</p>
									</div>
								</div>
							</div>
							<div className='flex items-center justify-between space-x-4'>
								<div className='flex items-center space-x-4'>
									<Avatar className='h-8 w-8'>
										<AvatarFallback>IN</AvatarFallback>
									</Avatar>
									<div>
										<p className='text-sm font-medium leading-none'>password</p>
										<p className='text-sm text-muted-foreground'>@string</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</TooltipProvider>
	);
}
