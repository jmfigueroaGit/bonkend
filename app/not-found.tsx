import Link from 'next/link';

export default function NotFound() {
	return (
		<div className='flex flex-col items-center justify-center h-screen '>
			<h1 className='text-4xl font-semibold text-center'>404</h1>
			<p className='text-lg text-center'>Page not found</p>
			<Link href='/' className='mt-4 text-accent hover:text-blue-700'>
				Go back home
			</Link>
		</div>
	);
}
