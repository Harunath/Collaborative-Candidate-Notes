"use client";

import { ComponentType, FC } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Loader from "@/components/ui/Loader";

type WithAuthOptions = {
	redirectTo?: string;
};

export default function withAuth<P extends object>(
	Wrapped: ComponentType<React.PropsWithChildren<P>>,
	options: WithAuthOptions = {}
): FC<React.PropsWithChildren<P>> {
	const { redirectTo = "/login" } = options;

	const Guard: FC<P> = (props) => {
		const { status } = useSession();
		const pathname = usePathname();

		// While checking session, show loader to prevent flicker
		if (status === "loading") {
			return <Loader label="Checking your session..." />;
		}

		// If unauthenticated, redirect on the client to login with callback
		if (status === "unauthenticated") {
			// Avoid useRouter here to prevent double-renders; use a hard replace.
			if (typeof window !== "undefined") {
				const url = new URL(redirectTo, window.location.origin);
				url.searchParams.set("callbackUrl", pathname || "/");
				window.location.replace(url.toString());
			}
			return <Loader label="Redirecting to login..." />;
		}

		// Authenticated, render the wrapped component
		return <Wrapped {...(props as React.PropsWithChildren<P>)} />;
	};

	// Set display name for better devtools experience
	Guard.displayName = `withAuth(${
		Wrapped.displayName || Wrapped.name || "Component"
	})`;

	return Guard;
}
