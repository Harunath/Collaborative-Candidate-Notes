"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

function Providers({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SessionProvider>
			<Toaster richColors position="top-right" closeButton expand />
			{children}
		</SessionProvider>
	);
}

export default Providers;
