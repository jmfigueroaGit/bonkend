import Link from 'next/link';
import React, { useEffect } from 'react';
import { createUserIfNotExists, getAuthUserDetails } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
	const authUser = await currentUser();

	if (authUser) {
		await createUserIfNotExists();
	}

	const user = await getAuthUserDetails();

	return (
		<main>
			<div>
				<h1>Page</h1>
				<p>
					<Link href='/forms' className='cursor-pointer'>
						Forms
					</Link>
				</p>
			</div>
		</main>
	);
}
