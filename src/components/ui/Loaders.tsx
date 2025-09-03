// ---- Reusable Skeleton primitive ----
function Skeleton({ className = "" }: { className?: string }) {
	return (
		<div
			className={`animate-pulse rounded-md bg-black/10 dark:bg-white/10 ${className}`}
		/>
	);
}

// ---- Candidates (left) skeleton ----
export const CandidatesSkeleton = () => {
	return (
		<div className="space-y-4">
			{/* Header row */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Skeleton className="h-6 w-6 rounded-full" />
					<Skeleton className="h-6 w-40" />
				</div>
				<Skeleton className="h-8 w-24 rounded-lg" />
			</div>

			{/* Inline create form skeleton */}
			<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mb-3 flex items-center gap-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-24" />
				</div>
				<div className="flex items-center gap-3">
					<Skeleton className="h-9 w-32" />
					<Skeleton className="h-9 w-20" />
				</div>
			</div>

			{/* List items */}
			<div className="space-y-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
						<Skeleton className="h-10 w-10 rounded-full" />
						<div className="min-w-0 flex-1 space-y-2">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-3 w-2/3" />
						</div>
						<Skeleton className="h-8 w-16 rounded-lg" />
					</div>
				))}
			</div>
		</div>
	);
};

// ---- Notifications (right) skeleton ----
export const NotificationsSkeleton = () => {
	return (
		<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-6 w-32" />
				</div>
				<Skeleton className="h-8 w-24 rounded-lg" />
			</div>

			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="flex gap-3 rounded-lg p-2">
						<Skeleton className="mt-1 h-3 w-3 shrink-0 rounded-full" />
						<div className="min-w-0 flex-1 space-y-2">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
						<Skeleton className="h-8 w-10 rounded-md" />
					</div>
				))}
			</div>
		</div>
	);
};
