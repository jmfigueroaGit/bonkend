import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, request) => {
	if (!isPublicRoute(request)) {
		auth().protect();
	}

	// const url = request.nextUrl;
	// const searchParams = url.searchParams.toString();
	// const hostname = request.headers.get('host');

	// // Construct the full path with search params
	// const pathWithSearchParams = `${url.pathname}${searchParams ? `?${searchParams}` : ''}`;

	// const customSubDomain = hostname?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`).filter(Boolean)[0];

	// // Subdomain Redirects
	// if (customSubDomain) {
	// 	// If subdomain found, redirect to subdomain route
	// 	return NextResponse.rewrite(new URL(`/${customSubDomain}${pathWithSearchParams}`, request.url));
	// }

	// // Specific Sign-In/Sign-Up Redirect
	// if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
	// 	return NextResponse.redirect(new URL('/sign-in', request.url));
	// }

	// // Root and '/site' Redirects
	// if (url.pathname === '/') {
	// 	return NextResponse.rewrite(new URL('/', request.url));
	// }
});

export const config = {
	matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
