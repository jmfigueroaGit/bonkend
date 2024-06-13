'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { SqlSchema, MongoSchema } from '@/lib/db/schemas';

import DatabaseForm from '@/components/forms/database-form';
import * as z from 'zod';
import { saveCredentials } from '@/lib/db/actions/queries/database';
import { useRouter } from 'next/navigation';
import { handleFormSubmit } from '@/lib/db/actions/forms/handler';
import { toast } from 'sonner';

export default function Page() {
	const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const router = useRouter();

	useEffect(() => {
		if (connectionStatus === 'success') {
			const timer = setTimeout(() => {
				setConnectionStatus('idle');
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [connectionStatus]);

	const handleTabChange = () => {
		setConnectionStatus('idle'); // Reset connection status
		setErrorMessage(''); // Reset error message
	};

	const onSave = async (values: z.infer<typeof SqlSchema> | z.infer<typeof MongoSchema>) => {
		await saveCredentials(values);
		toast.success('Database added successfully');
		router.push('/database');
	};

	return (
		<div className='h-full px-4 py-6 lg:px-8'>
			<Tabs onValueChange={handleTabChange} defaultValue='account'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='account'>SQL (MySQL)</TabsTrigger>
					<TabsTrigger value='password'>NoSQL (MongoDB)</TabsTrigger>
				</TabsList>
				<TabsContent value='account'>
					<DatabaseForm
						schema={SqlSchema}
						defaultValues={{
							name: '',
							databaseType: 'mysql',
							host: 'localhost',
							port: 3306,
							database: 'my_database',
							user: 'root',
							password: '',
						}}
						onSubmit={(values: any) => handleFormSubmit(values, setConnectionStatus, setErrorMessage)}
						onSave={onSave}
						connectionStatus={connectionStatus}
						errorMessage={errorMessage}
					/>
				</TabsContent>
				<TabsContent value='password'>
					<DatabaseForm
						schema={MongoSchema}
						defaultValues={{
							name: '',
							databaseType: 'mongodb',
							mongoUri: 'mongodb://localhost:27017/my_database',
						}}
						onSubmit={(values: any) => handleFormSubmit(values, setConnectionStatus, setErrorMessage)}
						onSave={onSave}
						connectionStatus={connectionStatus}
						errorMessage={errorMessage}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
