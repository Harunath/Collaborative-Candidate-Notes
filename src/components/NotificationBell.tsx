"use client";

import { useEffect, useState } from "react";
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
		refreshInterval: 25_000,
		revalidateOnFocus: true,
	});

	const unread = data?.unreadCount ?? 0;
	const items = data?.items ?? [];
	const router = useRouter();

	// Pusher realtime hookup
	useEffect(() => {
		const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
		const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;
		if (!key || !cluster) return;

		const pusher = new Pusher(key, { cluster, forceTLS: true });
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
				className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
				aria-label="Notifications">
				<FiBell className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
				{unread > 0 && (
					<span className="absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-5 text-neutral-50">
						{unread > 99 ? "99+" : unread}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-[22rem] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-2 shadow-xl">
					<div className="flex items-center justify-between p-2">
						<span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
							Notifications
						</span>
						{unread > 0 && (
							<button
								onClick={markAll}
								className="text-xs text-blue-500 hover:underline">
								Mark all as read
							</button>
						)}
					</div>

					<div className="max-h-[22rem] overflow-auto">
						{items.length === 0 ? (
							<div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
								No notifications
							</div>
						) : (
							<ul className="space-y-1">
								{items.map((n) => (
									<li
										key={n.id}
										className={`rounded-lg p-3 transition ${
											n.readAt
												? "bg-neutral-100 dark:bg-neutral-800"
												: "bg-blue-100 dark:bg-blue-900/30"
										} hover:bg-neutral-200 dark:hover:bg-neutral-700`}>
										<button
											className="w-full text-left"
											onClick={async () => {
												await markRead(n.id);
												router.push(
													`/candidates/${n.candidateId}?note=${n.noteId}`
												);
												setOpen(false);
											}}>
											<div className="text-xs text-neutral-500 dark:text-neutral-400">
												{n.candidate.name} •{" "}
												{new Date(n.createdAt).toLocaleString()}
											</div>
											<div className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
												{n.preview}
											</div>
										</button>
									</li>
								))}
							</ul>
						)}
					</div>

					<div className="p-2">
						<button
							className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
							onClick={() => {
								router.push("/notifications");
								setOpen(false);
							}}>
							View all
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
