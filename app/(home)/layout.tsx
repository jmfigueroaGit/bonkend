import { Sidebar } from '@/components/layouts/sidebar';
import { createUserIfNotExists } from '@/lib/db/actions/queries/user';
import { currentUser } from '@clerk/nextjs/server';
import React from 'react';

const layout = async ({ children }: { children: React.ReactNode }) => {
	const authUser = await currentUser();

	if (authUser) {
		await createUserIfNotExists();
	}
	return (
		<div className='hidden md:block '>
			<div className='border-t'>
				<div className='bg-background '>
					<div className='grid lg:grid-cols-5 h-screen'>
						<Sidebar className='hidden lg:block' />
						<div className='col-span-3 lg:col-span-4 lg:border-l px-4 py-6 lg:px-8'>{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default layout;
