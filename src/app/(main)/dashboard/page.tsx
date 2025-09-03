// app/dashboard/page.tsx
import Candidates from "@/components/home/Candidates";
import NotificationsCard from "@/components/home/NotificationsCard";
import {
	CandidatesSkeleton,
	NotificationsSkeleton,
} from "@/components/ui/Loaders";
import { Suspense } from "react";

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
						<Candidates />
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
