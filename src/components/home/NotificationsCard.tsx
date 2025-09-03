"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import { FiBell, FiCheck, FiLoader } from "react-icons/fi";
import { NotificationsSkeleton } from "../ui/Loaders";

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

type PageData = {
	ok: boolean;
	items: Item[];
	nextCursor: string | null;
	unreadCount: number;
};

function timeAgo(d: string) {
	const now = new Date().getTime();
	const t = new Date(d).getTime();
	const s = Math.max(1, Math.floor((now - t) / 1000));
	if (s < 60) return `${s}s ago`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const day = Math.floor(h / 24);
	return `${day}d ago`;
}

export default function NotificationsCard({
	className = "",
}: {
	className?: string;
}) {
	const router = useRouter();
	const [unreadBadge, setUnreadBadge] = useState<number>(0);

	const getKey = (pageIndex: number, previousPageData: PageData | null) => {
		if (previousPageData && !previousPageData.nextCursor) return null;
		const cursor =
			pageIndex === 0 ? "" : `&cursor=${previousPageData?.nextCursor ?? ""}`;
		return `/api/notifications?limit=15${cursor}`;
	};

	const { data, size, setSize, isLoading, isValidating, mutate } =
		useSWRInfinite<PageData>(getKey, fetcher, {
			refreshInterval: 25_000,
			revalidateOnFocus: true,
			revalidateFirstPage: true,
			// suspense: true, // optional with <Suspense fallback={<NotificationsSkeleton/>}>
		});

	const items = useMemo(
		() => (data ? data.flatMap((p) => p.items) : []),
		[data]
	);
	const hasMore = (data?.[data.length - 1]?.nextCursor ?? null) !== null;
	const unreadCount = data?.[0]?.unreadCount ?? 0;

	// Loading states
	const initialLoading = (!data && isValidating) || isLoading;
	const firstPageRefreshing = !!data && isValidating && size === 1;
	const loadingMore = isValidating && size > 1;

	useEffect(() => setUnreadBadge(unreadCount), [unreadCount]);

	// Realtime via Pusher
	useEffect(() => {
		const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
		const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;
		const userIdMeta = (
			document.querySelector("meta[name='x-user-id']") as HTMLMetaElement
		)?.content;
		if (!key || !cluster || !userIdMeta) return;

		const pusher = new Pusher(key, { cluster, forceTLS: true });
		const channel = pusher.subscribe(`user:${userIdMeta}`);

		const refresh = () => mutate();

		channel.bind("notification:new", refresh);
		channel.bind("notification:read", refresh);
		channel.bind("notification:read_all", refresh);

		return () => {
			channel.unbind_all();
			channel.unsubscribe();
			pusher.disconnect();
		};
	}, [mutate]);

	const markOne = async (id: string) => {
		await fetch(`/api/notifications/${id}`, { method: "PATCH" });
		mutate();
	};

	const markAll = async () => {
		await fetch(`/api/notifications`, { method: "PATCH" });
		mutate();
	};

	// Infinite scroll sentinel
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (!sentinelRef.current) return;
		const el = sentinelRef.current;
		const io = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && hasMore && !isValidating) {
				setSize((s) => s + 1);
			}
		});
		io.observe(el);
		return () => io.disconnect();
	}, [hasMore, isValidating, setSize]);

	// ⏳ Full skeleton on first mount
	if (initialLoading) {
		return <NotificationsSkeleton />;
	}

	return (
		<div
			className={`relative rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}>
			{/* Optional subtle overlay when first page is refreshing */}
			{firstPageRefreshing && (
				<div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-white/40 backdrop-blur-sm dark:bg-black/30" />
			)}

			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<FiBell className="h-5 w-5" />
					<h3 className="text-sm font-semibold">Notifications</h3>
					{unreadBadge > 0 && (
						<span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
							{unreadBadge > 99 ? "99+" : unreadBadge}
						</span>
					)}
				</div>
				{unreadBadge > 0 ? (
					<button
						onClick={markAll}
						className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/10">
						<FiCheck className="h-3.5 w-3.5" /> Mark all read
					</button>
				) : null}
			</div>

			<div className="max-h-[28rem] overflow-auto rounded-xl">
				{items.length === 0 ? (
					<div className="py-10 text-center text-sm text-gray/70">
						You&apos;re all caught up!
					</div>
				) : (
					<ul className="space-y-2 p-1">
						{items.map((n) => (
							<li
								key={n.id}
								className={`rounded-lg p-3 transition ${
									n.readAt
										? "bg-gray-200/20"
										: "bg-blue-200/10 ring-1 ring-blue-500/20"
								} hover:bg-gray-400/20`}>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2 text-xs text-gray-950/60">
											<span className="truncate font-medium">
												{n.candidate.name}
											</span>
											<span>•</span>
											<span>{timeAgo(n.createdAt)}</span>
										</div>
										<div className="mt-1 line-clamp-2 text-sm">{n.preview}</div>
									</div>

									{!n.readAt && (
										<button
											onClick={() => markOne(n.id)}
											className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[11px] text-gray-950/50 hover:text-blue-400 hover:bg-white/10">
											Mark read
										</button>
									)}
								</div>

								<div className="mt-2">
									<button
										className="text-xs text-blue-400 hover:underline"
										onClick={async () => {
											await markOne(n.id);
											router.push(
												`/candidates/${n.candidateId}?note=${n.noteId}`
											);
										}}>
										Open message →
									</button>
								</div>
							</li>
						))}
						{/* Sentinel for infinite scroll */}
						{hasMore && (
							<li>
								<div
									ref={sentinelRef}
									className="flex items-center justify-center gap-2 py-3 text-xs text-white/60">
									{loadingMore ? (
										<>
											<FiLoader className="h-4 w-4 animate-spin" />
											Loading more…
										</>
									) : (
										"Scroll to load more"
									)}
								</div>
							</li>
						)}
					</ul>
				)}
			</div>
		</div>
	);
}
