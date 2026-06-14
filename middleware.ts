import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  // Define route paths to protect. This excludes the auth pages /login, /register, and basic NextAuth api paths.
  matcher: [
    '/',
    '/day/:path*',
    '/history',
    '/profile',
    '/api/reading-log/:path*',
    '/api/monthly-summary/:path*',
    '/api/profile/:path*',
  ],
};
