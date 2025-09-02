// app/candidates/[id]/ChatRoom.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { toastErr, toastOK } from "@/lib/toast";
import MentionComposer from "./MentionComposer";

type Note = {
	id: string;
	content: string;
	createdAt: string;
	author: {
		id: string;
		name: string | null;
		email: string | null;
		username: string | null;
	};
};

export default function ChatRoom({
	candidateId,
	initialNotes,
}: {
	candidateId: string;
	initialNotes: Note[];
}) {
	const [notes, setNotes] = useState<Note[]>(initialNotes);
	const [text, setText] = useState("");
	const [joining, setJoining] = useState(true);
	const [sending, setSending] = useState(false);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const channelName = useMemo(
		() => `presence-candidate-${candidateId}`,
		[candidateId]
	);

	// Auto-scroll
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [notes.length]);

	useEffect(() => {
		// Presence/private channel requires auth endpoint
		const channel = pusherClient.subscribe(channelName);
		channel.bind("pusher:subscription_succeeded", () => setJoining(false));

		channel.bind("message:new", (payload: Note) => {
			setNotes((prev) => [...prev, payload]);
		});

		return () => {
			channel.unbind_all();
			pusherClient.unsubscribe(channelName);
		};
	}, [channelName]);

	async function sendMessage() {
		const content = text.trim();
		if (!content) return;

		setSending(true);
		try {
			const res = await fetch(`/api/candidates/${candidateId}/notes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content }),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) {
				// You can show a toast here
				toastErr("Failed to send message");
				return;
			}
			toastOK("Message sent");
			setText("");
			// No need to manually add; the Pusher event will append the new message
		} finally {
			setSending(false);
		}
	}

	return (
		<div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
			{/* Messages */}
			<div className="max-h-[60vh] overflow-y-auto p-4">
				{notes.length === 0 ? (
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						No messages yet.
					</p>
				) : (
					<ul className="space-y-3">
						{notes.map((n) => (
							<li
								key={n.id}
								className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
								<div className="text-xs text-zinc-600 dark:text-zinc-400">
									{"@" + (n.author.username ?? n.author.name ?? "Unknown")}
									<span className="px-1">•</span>
									{new Date(n.createdAt).toLocaleTimeString()}
								</div>
								<div className="mt-1 whitespace-pre-wrap text-sm text-zinc-900 dark:text-zinc-100">
									{n.content}
								</div>
							</li>
						))}
						<div ref={bottomRef} />
					</ul>
				)}
			</div>

			{/* Composer */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				className="flex items-end gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
				<MentionComposer
					value={text}
					onChange={setText}
					onSubmit={sendMessage}
					disabled={joining || sending}
				/>
				<button
					type="submit"
					disabled={joining || sending || !text.trim()}
					className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
					Send
				</button>
			</form>
		</div>
	);
}
