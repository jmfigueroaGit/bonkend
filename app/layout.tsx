import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import './globals.css';

import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/common/theme-provider';
import Navigation from '@/components/navigation';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export const metadata: Metadata = {
	title: 'Bonkend.',
	description: 'Generate and manage your API endpoints with ease.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider appearance={{ baseTheme: dark }}>
			<html lang='en' suppressHydrationWarning>
				<body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
					<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
						<Navigation />
						<div className='pt-16'>{children}</div>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
