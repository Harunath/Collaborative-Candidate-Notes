// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function middleware(req) {
		const { pathname } = req.nextUrl;

		// allow NextAuth endpoints
		if (pathname.startsWith("/api/auth")) return NextResponse.next();

		// protect all other /api/* routes
		if (pathname.startsWith("/api")) {
			// if not authenticated, withAuth gives us req.nextauth.token
			if (!req.nextauth?.token) {
				return NextResponse.json(
					{ ok: false, error: "Unauthorized" },
					{ status: 401 }
				);
			}
		}

		return NextResponse.next();
	},
	{
		// Don't auto-redirect for API calls; we’re returning JSON above.
		callbacks: {
			authorized: ({ token }) => !!token, // required for withAuth
		},
		pages: {
			signIn: "/login", // used for page navigations (non-API)
		},
	}
);

// only run on API routes for performance
export const config = {
	matcher: ["/api/:path*"],
};
