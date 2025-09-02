// components/Candidates.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import {
	createCandidateSchema,
	type CreateCandidateInput,
} from "@/lib/validation/candidate";
import { useRouter } from "next/navigation";

type Candidate = {
	id: string;
	name: string;
	email: string;
	createdAt: string;
	createdById: string;
};

type ListResponse = {
	ok: boolean;
	items: Candidate[];
	nextCursor: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Candidates() {
	const [query, setQuery] = useState("");
	const [form, setForm] = useState<CreateCandidateInput>({
		name: "",
		email: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const router = useRouter();
	const getKey = useCallback(
		(pageIndex: number, previousPageData: ListResponse | null) => {
			if (previousPageData && !previousPageData.nextCursor) return null;
			const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor ?? "";
			const params = new URLSearchParams();
			if (query) params.set("q", query);
			if (cursor) params.set("cursor", cursor);
			params.set("limit", "10");
			return `/api/candidates?${params.toString()}`;
		},
		[query]
	);

	const { data, size, setSize, isValidating, mutate } =
		useSWRInfinite<ListResponse>(getKey, fetcher, {
			revalidateFirstPage: true,
		});

	const items = useMemo(
		() => (data ? data.flatMap((d) => d.items) : []),
		[data]
	);
	const nextCursor = data?.[data.length - 1]?.nextCursor ?? null;
	const loadingMore = isValidating && size > 0;

	async function onCreate(e: React.FormEvent) {
		e.preventDefault();
		setErrors({});
		const parsed = createCandidateSchema.safeParse(form);
		if (!parsed.success) {
			setErrors(parsed.error.flatten().fieldErrors);
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch("/api/candidates", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(parsed.data),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) {
				setErrors(json.errors ?? { root: ["Failed to create"] });
				return;
			}
			setForm({ name: "", email: "" });
			// Refresh the first page to show new item
			await mutate();
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="space-y-4">
			{/* Header + Search */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
					Candidates
				</div>
				<input
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
					}}
					placeholder="Search candidates..."
					className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:w-72"
				/>
			</div>

			{/* Inline create */}
			<form
				onSubmit={onCreate}
				className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
					<div className="sm:col-span-4">
						<label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
							Name<span className="text-red-500">*</span>
						</label>
						<input
							value={form.name}
							onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
							className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
						/>
						{errors.name?.[0] && (
							<p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>
						)}
					</div>
					<div className="sm:col-span-4">
						<label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
							Email
						</label>
						<input
							type="email"
							value={form.email}
							onChange={(e) =>
								setForm((p) => ({ ...p, email: e.target.value }))
							}
							className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
						/>
					</div>
					<div className="sm:col-span-1 flex items-end">
						<button
							type="submit"
							disabled={submitting}
							className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
							{submitting ? "Saving..." : "Add"}
						</button>
					</div>
				</div>
			</form>

			{/* List */}
			<div className="space-y-3">
				{items.map((c) => (
					<div
						key={c.id}
						className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
							{c.name?.[0]?.toUpperCase() ?? "?"}
						</div>
						<div className="min-w-0 flex-1">
							<div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
								{c.name}
							</div>
							<div className="truncate text-xs text-zinc-600 dark:text-zinc-400">
								{c.email}
							</div>
						</div>
						{/* Deep-link button placeholder */}
						<button
							className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
							onClick={() => {
								router.push(`/candidates/${c.id}`);
							}}>
							Open
						</button>
					</div>
				))}

				{/* Load more */}
				{nextCursor ? (
					<div className="pt-2">
						<button
							onClick={() => setSize(size + 1)}
							disabled={loadingMore}
							className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
							{loadingMore ? "Loading..." : "Load more"}
						</button>
					</div>
				) : (
					<p className="py-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
						{isValidating && items.length === 0
							? "Loading..."
							: "No more results"}
					</p>
				)}
			</div>
		</div>
	);
}
