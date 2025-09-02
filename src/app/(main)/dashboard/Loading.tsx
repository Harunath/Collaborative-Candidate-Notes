// app/dashboard/loading.tsx
// Optional: route-level skeleton while the page (or nested data) loads
export default function Loading() {
	// Mirror the layout so it doesn’t cause layout shift
	return (
		<main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
			<div className="mb-6">
				<div className="h-7 w-40 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
				<div className="mt-2 h-4 w-80 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<section className="lg:col-span-2">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-6 w-6 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
								<div className="h-6 w-40 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
							</div>
							<div className="h-8 w-24 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" />
						</div>
						<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<div className="mb-3 flex items-center gap-3">
								<div className="h-10 w-full animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
								<div className="h-10 w-24 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
							</div>
							<div className="flex items-center gap-3">
								<div className="h-9 w-32 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
								<div className="h-9 w-20 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
							</div>
						</div>
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
								<div className="h-10 w-10 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
								<div className="min-w-0 flex-1 space-y-2">
									<div className="h-4 w-1/3 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
									<div className="h-3 w-2/3 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
								</div>
								<div className="h-8 w-16 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" />
							</div>
						))}
					</div>
				</section>

				<aside className="lg:col-span-1">
					<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="h-5 w-5 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
								<div className="h-6 w-32 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
							</div>
							<div className="h-8 w-24 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" />
						</div>
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex gap-3 rounded-lg p-2">
									<div className="mt-1 h-3 w-3 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
									<div className="min-w-0 flex-1 space-y-2">
										<div className="h-4 w-3/4 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
										<div className="h-3 w-1/2 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
									</div>
									<div className="h-8 w-10 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
								</div>
							))}
						</div>
					</div>
				</aside>
			</div>
		</main>
	);
}
