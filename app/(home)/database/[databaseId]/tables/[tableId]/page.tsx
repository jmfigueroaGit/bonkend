'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColumnSchema, TableWithArrayColumnSchema } from '@/lib/db/schemas';
import { Pencil, PlusCircle, Settings, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db';
import { createColumnOnTable } from '@/lib/db/actions/queries/table';
import { generateApiQueries } from '@/lib/db/actions/queries/api';

export default function AddTablePage() {
	const params = useParams();
	const databaseId = Array.isArray(params.databaseId) ? params.databaseId[0] : params.databaseId;
	const tableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;

	return (
		<div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
			<Card x-chunk='A card with a form to edit the product details'>
				<CardHeader>
					<CardTitle>Table for Database</CardTitle>
					<CardDescription>Table info</CardDescription>
				</CardHeader>
				<CardContent>Table info</CardContent>
			</Card>
		</div>
	);
}
