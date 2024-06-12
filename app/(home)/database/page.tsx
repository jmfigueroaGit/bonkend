import Link from 'next/link';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDatabaseList } from '@/lib/db/actions/database';
import { Database } from '@prisma/client';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis } from 'lucide-react';

export default async function Page() {
	const databases: Database[] = (await getDatabaseList()) as Database[];

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
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='hidden sm:table-cell'>Type</TableHead>
								<TableHead className='hidden sm:table-cell'>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{databases.map((database) => (
								<TableRow key={database.id}>
									<TableCell className='hidden sm:table-cell'>
										{database.type === 'mongodb' ? 'MongoDB' : 'MySQL'}
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
												<DropdownMenuCheckboxItem>
													<Link href={`/database/${database.id}/tables`}>Delete Database </Link>
												</DropdownMenuCheckboxItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
