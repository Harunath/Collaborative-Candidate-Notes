"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Item = {
	id: string;
	candidateId: string;
	noteId: string;
	preview: string;
	createdAt: string;
	readAt: string | null;
	candidate: { id: string; name: string };
};

export default function NotificationBell() {
	const [open, setOpen] = useState(false);
	const { data, mutate } = useSWR<{
		ok: boolean;
		items: Item[];
		nextCursor: string | null;
		unreadCount: number;
	}>("/api/notifications?limit=20", fetcher, {
		refreshInterval: 25_000, // lightweight polling (fallback)
		revalidateOnFocus: true,
	});

	const unread = data?.unreadCount ?? 0;
	const items = data?.items ?? [];
	const router = useRouter();

	// Pusher realtime hookup
	useEffect(() => {
		// Guard: only init once per mount
		const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
		const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;
		if (!key || !cluster) return;

		const pusher = new Pusher(key, { cluster, forceTLS: true });
		// The user channel name should match what server triggers, e.g. `user:${session.user.id}`
		// To avoid exposing user id, you can also use private/presence channels with auth.
		const userIdMeta = (
			document.querySelector("meta[name='x-user-id']") as HTMLMetaElement
		)?.content;
		if (!userIdMeta) return;

		const channel = pusher.subscribe(`user:${userIdMeta}`);
		channel.bind("notification:new", () => mutate());
		channel.bind("notification:read", () => mutate());
		channel.bind("notification:read_all", () => mutate());

		return () => {
			channel.unbind_all();
			channel.unsubscribe();
			pusher.disconnect();
		};
	}, [mutate]);

	const markRead = async (id: string) => {
		await fetch(`/api/notifications/${id}`, { method: "PATCH" });
		mutate();
	};

	const markAll = async () => {
		await fetch("/api/notifications", { method: "PATCH" });
		mutate();
	};

	return (
		<div className="relative">
			<button
				onClick={() => setOpen((s) => !s)}
				className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-white/10"
				aria-label="Notifications">
				<FiBell className="h-6 w-6" />
				{unread > 0 && (
					<span className="absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-5 text-white">
						{unread > 99 ? "99+" : unread}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-[22rem] rounded-xl border border-white/10 bg-neutral-900 p-2 shadow-xl">
					<div className="flex items-center justify-between p-2">
						<span className="text-sm font-medium">Notifications</span>
						{unread > 0 && (
							<button
								onClick={markAll}
								className="text-xs text-blue-400 hover:underline">
								Mark all as read
							</button>
						)}
					</div>

					<div className="max-h-[22rem] overflow-auto">
						{items.length === 0 ? (
							<div className="p-4 text-sm text-white/70">No notifications</div>
						) : (
							<ul className="space-y-1">
								{items.map((n) => (
									<li
										key={n.id}
										className={`rounded-lg p-3 transition ${
											n.readAt ? "bg-white/[0.04]" : "bg-blue-500/10"
										} hover:bg-white/[0.08]`}>
										<button
											className="w-full text-left"
											onClick={async () => {
												await markRead(n.id);
												router.push(
													`/candidates/${n.candidateId}?note=${n.noteId}`
												);
												setOpen(false);
											}}>
											<div className="text-xs text-white/60">
												{n.candidate.name} •{" "}
												{new Date(n.createdAt).toLocaleString()}
											</div>
											<div className="mt-1 text-sm">{n.preview}</div>
										</button>
									</li>
								))}
							</ul>
						)}
					</div>

					<div className="p-2">
						<button
							className="w-full rounded-md border border-white/10 py-2 text-sm hover:bg-white/[0.06]"
							onClick={() => router.push("/notifications")}>
							View all
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
