import React from "react";

import Navbar from "@/components/nav/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	if (!session || !session?.user.id) redirect("/login");
	return (
		<div className="w-screen min-h-screen">
			<Navbar />
			{children}
		</div>
	);
}
