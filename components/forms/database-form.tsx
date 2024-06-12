'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useForm, SubmitHandler, FieldValues, Path } from 'react-hook-form';
import { set, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

interface DatabaseFormProps<T extends FieldValues> {
	schema: z.Schema<T>;
	defaultValues: any;
	onSubmit: SubmitHandler<T>;
	onSave: SubmitHandler<T>;
	connectionStatus: 'idle' | 'connecting' | 'success' | 'error';
	errorMessage: string;
}

const DatabaseForm = <T extends FieldValues>({
	schema,
	defaultValues,
	onSubmit,
	onSave,
	connectionStatus,
	errorMessage,
}: DatabaseFormProps<T>) => {
	const [disable, setDisable] = useState(true);
	const form = useForm<T>({
		mode: 'onChange',
		resolver: zodResolver(schema),
		defaultValues,
	});

	useEffect(() => {
		if (connectionStatus === 'success') {
			setDisable(false);
		}
	}, [connectionStatus, form]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{defaultValues['databaseType'] === 'mysql' ? 'MySQL' : 'MongoDB'}</CardTitle>
			</CardHeader>
			<CardContent className='space-y-2'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSave)} className='space-y-8'>
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
												<Input type={key === 'port' ? 'number' : key === 'password' ? 'password' : 'text'} {...field} />
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
							<Button type='button' variant='secondary' onClick={form.handleSubmit(onSubmit)}>
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
							<Button type='submit' disabled={disable}>
								Save changes
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

export default DatabaseForm;
