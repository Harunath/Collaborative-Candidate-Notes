"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import NotificationBell from "../NotificationBell";

export default function AuthActions() {
	const { status, data } = useSession();
	const [loggingOut, setLoggingOut] = useState(false);

	if (status === "loading") {
		return (
			<div className="flex items-center gap-2">
				<span
					className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent"
					aria-hidden
				/>
				<span className="text-sm text-zinc-600">Loading...</span>
			</div>
		);
	}

	if (status === "unauthenticated") {
		return (
			<div className="flex items-center gap-3">
				<Link
					href="/login"
					className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50">
					Login
				</Link>
				<Link
					href="/register"
					className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-black/90">
					Sign up
				</Link>
			</div>
		);
	}

	// Authenticated
	const name = data?.user?.name ?? "Account";
	const image = (
		data?.user && "image" in data.user
			? (data.user as { image?: string }).image
			: undefined
	) as string | undefined;

	return (
		<div className="flex items-center gap-3">
			<Link
				href="/dashboard"
				className="hidden sm:inline-block rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50">
				Dashboard
			</Link>
			<NotificationBell />
			<Link
				href="/profile"
				className="flex items-center gap-2 rounded-full border border-zinc-200 px-2 py-1">
				{image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={image}
						alt={name}
						className="h-6 w-6 rounded-full object-cover"
					/>
				) : (
					<div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs">
						{name.slice(0, 1).toUpperCase()}
					</div>
				)}
				<span className="hidden text-sm text-zinc-700 sm:inline">{name}</span>
			</Link>
			<button
				disabled={loggingOut}
				onClick={async () => {
					setLoggingOut(true);
					await signOut({ callbackUrl: "/" });
				}}
				className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-black/90 disabled:opacity-60">
				{loggingOut ? "Logging out..." : "Logout"}
			</button>
		</div>
	);
}
