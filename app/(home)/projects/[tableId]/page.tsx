'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Api, Column, Table } from '@prisma/client';
import { getTableById } from '@/lib/db/actions/queries/table';

export default function PlaygroundPage() {
	const params = useParams();
	const tableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
	const [table, setTable] = useState<{
		id: string;
		name: string;
		databaseId: string;
		columns: Column[];
		apis: { id: string; name: string; route: string; method: string; tableId: string }[];
	} | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
				setIsLoading(true);
				const table = await getTableById(tableId);
				if (table) {
					setTable(
						table as {
							id: string;
							name: string;
							databaseId: string;
							columns: Column[];
							apis: { id: string; name: string; route: string; method: string; tableId: string }[];
						} | null
					);
				} else {
					setError('Table not found');
				}
			} catch (error) {
				console.error('Error fetching data:', error);
				setError('An unexpected error occurred');
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();

		if (table) {
			console.log(generateJsonTemplate());
		}
	}, [tableId]);

	// GenerateJSON Template for the Playground using the table columns and apis
	const generateJsonTemplate = (): string => {
		if (table && table.columns) {
			const template = table.columns.reduce((acc: any, column: any) => {
				switch (column.dataType) {
					case 'INT':
					case 'DECIMAL':
					case 'decimal':
					case 'number':
						acc[column.name] = 0;
						break;
					case 'BOOLEAN':
					case 'bool':
						acc[column.name] = false;
						break;
					case 'DATE':
					case 'DATETIME':
					case 'date':
						acc[column.name] = new Date().toISOString().split('T')[0]; // Default to today's date (YYYY-MM-DD)
						break;
					case 'JSON':
					case 'object':
						acc[column.name] = {};
						break;
					default: // String, Text, JSON, etc.
						acc[column.name] = '';
				}
				return acc;
			}, {});
			return JSON.stringify(template, null, 2); // 2 spaces for indentation
		}
		return '';
	};

	return (
		<div className='hidden h-full flex-col md:flex'>
			<div className='container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16'>
				<h2 className='text-lg font-semibold'>Playground</h2>
			</div>
			<Separator />
			<div className='flex flex-col space-y-4 mt-2'>
				<div className='grid h-full grid-rows-2 gap-6 lg:grid-cols-2 lg:grid-rows-1'>
					<Textarea
						placeholder='Paste your code here...'
						className='h-full min-h-[300px] lg:min-h-[700px] xl:min-h-[700px]'
					/>
					<div className='rounded-md border bg-muted'></div>
				</div>
				<div className='flex justify-end space-x-2'>
					<Button>Submit</Button>
				</div>
			</div>
		</div>
	);
}
