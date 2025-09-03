import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	if (session?.user.id) redirect("/dashboard");
	return <div className="w-screen min-h-screen">{children}</div>;
}

// Optional: pass a custom login route
