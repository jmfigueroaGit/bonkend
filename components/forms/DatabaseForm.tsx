'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useForm, SubmitHandler, FieldValues, Path } from 'react-hook-form'; // Import FieldValues
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

interface DatabaseFormProps<T extends FieldValues> {
	// Constraint to FieldValues
	schema: z.Schema<T>; // Use z.Schema from zod
	defaultValues: any; // Partial for optional default values
	onSubmit: SubmitHandler<T>;
	connectionStatus: 'idle' | 'connecting' | 'success' | 'error';
	errorMessage: string;
}

const DatabaseForm = <T extends FieldValues>({
	schema,
	defaultValues,
	onSubmit,
	connectionStatus,
	errorMessage,
}: DatabaseFormProps<T>) => {
	const form = useForm<T>({
		mode: 'onChange',
		resolver: zodResolver(schema),
		defaultValues,
	});

	useEffect(() => {
		if (connectionStatus === 'success') {
			const timer = setTimeout(() => {
				form.reset();
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [connectionStatus, form]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{defaultValues['databaseType'] === 'mysql' ? 'MySQL' : 'MongoDB'}</CardTitle>
			</CardHeader>
			<CardContent className='space-y-2'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						{Object.keys(defaultValues).map((key) =>
							key !== 'databaseType' ? (
								<FormField
									key={key}
									control={form.control}
									name={key as Path<T>}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
											<FormControl>
												<Input type={key === 'port' ? 'number' : 'text'} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							) : null
						)}

						{connectionStatus === 'error' && <p className='text-red-500'>{errorMessage}</p>}

						{connectionStatus === 'success' && <p className='text-green-500'>Connected!</p>}

						<div className='flex justify-between'>
							<Button type='submit' variant='secondary'>
								{connectionStatus === 'connecting' ? (
									<>
										<Loader2 /> <span>Connecting...</span>
									</>
								) : connectionStatus === 'success' ? (
									'Connected!'
								) : (
									'Test Connection'
								)}
							</Button>
							<Button type='button'>Save changes</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

export default DatabaseForm;
