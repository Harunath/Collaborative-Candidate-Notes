// app/candidates/[id]/MentionComposer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type UserHit = { id: string; name: string; username: string; image?: string };

export default function MentionComposer({
	value,
	onChange,
	onSubmit,
	disabled,
}: {
	value: string;
	onChange: (val: string) => void;
	onSubmit: () => void; // no-arg submit; parent form handles the event
	disabled?: boolean;
}) {
	const taRef = useRef<HTMLTextAreaElement>(null);
	const [query, setQuery] = useState<string | null>(null);
	const [hits, setHits] = useState<UserHit[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const [open, setOpen] = useState(false);

	// Scan around the caret for an @mention token
	const scanForMention = () => {
		const ta = taRef.current;
		if (!ta) return setQuery(null);
		const caret = ta.selectionStart ?? 0;
		const text = ta.value;

		// Find the word boundary behind the caret
		let i = caret - 1;
		while (i >= 0 && !/\s/.test(text[i])) i--;
		const token = text.slice(i + 1, caret);

		if (token.startsWith("@")) {
			setQuery(token.slice(1)); // may be ""
			setOpen(true);
		} else {
			setQuery(null);
			setOpen(false);
		}
	};

	// Replace the current @partial with the chosen username
	const selectUser = (u: { username: string }) => {
		const ta = taRef.current!;
		const caret = ta.selectionStart ?? 0;
		const before = ta.value.slice(0, caret);
		const match = before.match(/(^|\s)@[\w-]*$/);
		if (!match) {
			// fallback: just append
			onChange(value + ` @${u.username} `);
		} else {
			const start = match.index! + match[1].length;
			const newText =
				ta.value.slice(0, start) +
				"@" +
				u.username +
				" " +
				ta.value.slice(caret);
			onChange(newText);

			// Move caret to just after the inserted username + space
			requestAnimationFrame(() => {
				const pos = start + u.username.length + 2; // "@" + username + " "
				ta.setSelectionRange(pos, pos);
				ta.focus();
			});
		}

		setQuery(null);
		setHits([]);
		setOpen(false);
	};

	// Fetch suggestions when query changes
	useEffect(() => {
		if (query === null) {
			setHits([]);
			return;
		}
		const ac = new AbortController();
		const url = `/api/users/search?q=${encodeURIComponent(query)}`;
		fetch(url, { signal: ac.signal })
			.then((r) => r.json())
			.then((d) => setHits((d.items ?? []) as UserHit[]))
			.catch(() => {});
		return () => ac.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);

	return (
		<div className="relative flex-1">
			<textarea
				ref={taRef}
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					scanForMention();
				}}
				onClick={scanForMention}
				onKeyUp={scanForMention}
				disabled={disabled}
				rows={2}
				placeholder="Type a message. Use @username to tag."
				className="min-h-[44px] w-full resize-y rounded-lg border border-zinc-200 bg-white p-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
				onKeyDown={(e) => {
					if (open) {
						if (hits.length) {
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setActiveIndex((i) => (i + 1) % hits.length);
							} else if (e.key === "ArrowUp") {
								e.preventDefault();
								setActiveIndex((i) => (i - 1 + hits.length) % hits.length);
							} else if (e.key === "Enter") {
								e.preventDefault();
								selectUser(hits[activeIndex]);
							} else if (e.key === "Escape") {
								setOpen(false);
								setQuery(null);
								setHits([]);
							}
						} else {
							// No hits: allow Escape to close the popover
							if (e.key === "Escape") {
								setOpen(false);
								setQuery(null);
							}
						}
					} else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
						e.preventDefault();
						onSubmit(); // parent form handles send
					}
				}}
			/>

			{/* Suggestions popover */}
			{open && (
				<div
					className="absolute z-50 mt-2 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
					style={{ left: 0, bottom: -8 }} // anchor under the textarea; simple + reliable
					onMouseDown={(e) => e.preventDefault()} // keep focus in textarea
				>
					{hits.length === 0 ? (
						<div className="px-3 py-2 text-sm text-zinc-500">
							No users found
						</div>
					) : (
						<ul className="max-h-64 overflow-auto">
							{hits.map((u, i) => (
								<li
									key={u.id}
									className={`cursor-pointer px-3 py-2 text-sm ${
										i === activeIndex ? "bg-zinc-100 dark:bg-zinc-800" : ""
									}`}
									onMouseDown={() => selectUser(u)}
									onMouseEnter={() => setActiveIndex(i)}>
									<div className="font-medium">@{u.username}</div>
									<div className="text-xs text-zinc-500">{u.name}</div>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
