// app/dashboard/page.tsx
import Candidates from "@/components/home/Candidates";
import NotificationsCard from "@/components/home/NotificationsCard";
import { Suspense } from "react";

// ---- Reusable Skeleton primitive ----
function Skeleton({ className = "" }: { className?: string }) {
	return (
		<div
			className={`animate-pulse rounded-md bg-black/10 dark:bg-white/10 ${className}`}
		/>
	);
}

// ---- Candidates (left) skeleton ----
function CandidatesSkeleton() {
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
}

// ---- Notifications (right) skeleton ----
function NotificationsSkeleton() {
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
}

// ---- Placeholder panels (replace with real components later) ----
async function CandidatesPanel() {
	// Replace with real data fetch
	// await new Promise((r) => setTimeout(r, 1200));
	return <CandidatesSkeleton />;
}

async function NotificationsPanel() {
	// Replace with real data fetch
	// await new Promise((r) => setTimeout(r, 1200));
	return <NotificationsSkeleton />;
}

export default async function DashboardPage() {
	return (
		<main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
			{/* Page header */}
			<header className="mb-6">
				<h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
					Dashboard
				</h1>
				<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
					Candidates on the left • Notifications on the right
				</p>
			</header>

			{/* 2-column layout */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left: Candidates (spans 2) */}
				<section className="lg:col-span-2">
					<Suspense fallback={<CandidatesSkeleton />}>
						{/* Replace with real component later */}
						<Candidates />
						{/* <CandidatesPanel /> */}
					</Suspense>
				</section>

				{/* Right: Notifications (spans 1) */}
				<aside className="lg:col-span-1">
					<Suspense fallback={<NotificationsSkeleton />}>
						{/* Replace with real component later */}
						<NotificationsCard />
						{/* <NotificationsPanel /> */}
					</Suspense>
				</aside>
			</div>
		</main>
	);
}
