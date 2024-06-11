'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { SqlSchema, MongoSchema } from '@/lib/schemas';

import DatabaseForm from '@/components/forms/DatabaseForm';
import { handleFormSubmit } from '@/lib/forms/formHandler';

export default function Page() {
	const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [activeTab, setActiveTab] = useState('account');

	useEffect(() => {
		if (connectionStatus === 'success') {
			const timer = setTimeout(() => {
				setConnectionStatus('idle');
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [connectionStatus]);

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		setConnectionStatus('idle'); // Reset connection status
		setErrorMessage(''); // Reset error message
	};

	return (
		<div className='flex h-screen items-center justify-center'>
			<Tabs onValueChange={handleTabChange} defaultValue='account' className='w-[400px]'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='account'>SQL (MySQL)</TabsTrigger>
					<TabsTrigger value='password'>NoSQL (MongoDB)</TabsTrigger>
				</TabsList>
				<TabsContent value='account'>
					<DatabaseForm
						schema={SqlSchema}
						defaultValues={{
							databaseType: 'mysql',
							host: 'localhost',
							port: 3306,
							database: 'my_database',
							user: 'root',
							password: '',
						}}
						onSubmit={(values: any) => handleFormSubmit(values, setConnectionStatus, setErrorMessage)}
						connectionStatus={connectionStatus}
						errorMessage={errorMessage}
					/>
				</TabsContent>
				<TabsContent value='password'>
					<DatabaseForm
						schema={MongoSchema}
						defaultValues={{
							databaseType: 'mongodb',
							uri: 'mongodb://localhost:27017/my_database',
						}}
						onSubmit={(values: any) => handleFormSubmit(values, setConnectionStatus, setErrorMessage)}
						connectionStatus={connectionStatus}
						errorMessage={errorMessage}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
