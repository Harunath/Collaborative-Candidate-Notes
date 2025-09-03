"use client";

import { useCallback, useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import {
	createCandidateSchema,
	type CreateCandidateInput,
} from "@/lib/validation/candidate";
import { useRouter } from "next/navigation";
import { CandidatesSkeleton } from "../ui/Loaders";
import { toastErr, toastOK } from "@/lib/toast";
import { FiX } from "react-icons/fi";

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
	const [openCreate, setOpenCreate] = useState(false);
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

	const { data, size, setSize, isValidating, mutate /*, error*/ } =
		useSWRInfinite<ListResponse>(getKey, fetcher, {
			revalidateFirstPage: true,
			// suspense: true, // Optional: enable and wrap this component with <Suspense fallback={<CandidatesSkeleton/>}>
		});

	const items = useMemo(
		() => (data ? data.flatMap((d) => d.items) : []),
		[data]
	);
	const nextCursor = data?.[data.length - 1]?.nextCursor ?? null;

	// Loading states
	const initialLoading = !data && isValidating;
	const firstPageRefreshing = !!data && isValidating && size === 1;
	const loadingMore = isValidating && size > 1;

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
				toastErr("Failed to create candidate");
				setErrors(json.errors ?? { root: ["Failed to create"] });
				return;
			}
			toastOK("Candidate created successfully");
			setForm({ name: "", email: "" });
			await mutate(); // refresh first page
		} finally {
			setOpenCreate(false);
			setSubmitting(false);
		}
	}

	// ⏳ Show full skeleton on first mount (no data yet)
	if (initialLoading) {
		return <CandidatesSkeleton />;
	}

	return (
		<div className="relative space-y-4">
			{/* Optional subtle overlay while refreshing first page */}
			{firstPageRefreshing && (
				<div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-white/40 backdrop-blur-sm dark:bg-black/30" />
			)}

			{/* Header + Search */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
					Candidates
				</div>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search candidates..."
					className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:w-72"
				/>
			</div>

			{/* Inline create */}
			{openCreate ? (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm px-4"
						onClick={() => setOpenCreate(false)}
						aria-hidden="true"
					/>

					{/* Modal Panel */}
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="create-candidate-title"
						className="fixed inset-0 z-50 flex items-center justify-center px-4">
						<div
							className="relative w-full max-w-xl rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
							onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
						>
							{/* Close button (top-right) */}
							<button
								type="button"
								onClick={() => setOpenCreate(false)}
								aria-label="Close"
								className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-200/60 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:ring-neutral-600">
								<FiX className="h-5 w-5" />
							</button>

							{/* Header (optional) */}
							<h2
								id="create-candidate-title"
								className="mb-4 pr-12 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
								Create Candidate
							</h2>

							{/* Form */}
							<form
								onSubmit={onCreate}
								className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
									<div className="sm:col-span-6">
										<label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
											Name <span className="text-red-500">*</span>
										</label>
										<input
											value={form.name}
											onChange={(e) =>
												setForm((p) => ({ ...p, name: e.target.value }))
											}
											className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
										/>
										{errors.name?.[0] && (
											<p className="mt-1 text-xs text-red-500">
												{errors.name[0]}
											</p>
										)}
									</div>

									<div className="sm:col-span-6">
										<label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
											Email <span className="text-red-500">*</span>
										</label>
										<input
											type="email"
											value={form.email}
											onChange={(e) =>
												setForm((p) => ({ ...p, email: e.target.value }))
											}
											className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
										/>
									</div>

									<div className="sm:col-span-12 flex items-center justify-end gap-2 pt-2">
										<button
											type="button"
											onClick={() => setOpenCreate(false)}
											className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200/60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
											Cancel
										</button>
										<button
											type="submit"
											disabled={submitting}
											className="inline-flex items-center justify-center rounded-lg bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300">
											{submitting ? "Saving..." : "Add"}
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</>
			) : (
				<>
					<button
						className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
						onClick={() => setOpenCreate(true)}>
						Add Candidate
					</button>
				</>
			)}

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
						<button
							className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
							onClick={() => router.push(`/candidates/${c.id}`)}>
							Open
						</button>
					</div>
				))}

				{/* Loading more… show small skeletons or just change button label */}
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
