'use client';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';
import { ModeToggle } from '@/components/common/mode-toggle';

const Navigation = () => {
	return (
		<div className='fixed top-0 right-0 left-0 p-4 flex items-center justify-between z-10'>
			<aside className='flex items-center gap-2'>
				<Link href='/' className='text-xl font-bold cursor-pointer'>
					{' '}
					Bonkend.
				</Link>
			</aside>
			{/* <nav className='hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]'>
				<ul className='flex items-center justify-center gap-8'>
					<Link href={'#'}>Pricing</Link>
					<Link href={'#'}>About</Link>
					<Link href={'#'}>Documentation</Link>
					<Link href={'#'}>Features</Link>
				</ul>
			</nav> */}
			<aside className='flex gap-2 items-center'>
				<UserButton />
				<ModeToggle />
			</aside>
		</div>
	);
};

export default Navigation;
