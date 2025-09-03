"use client";

import Link from "next/link";
import { useState } from "react";
import AuthActions from "./AuthActions";

export default function Navbar() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur">
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
				{/* Left: Brand */}
				<div className="flex items-center gap-3">
					<Link href="/" className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
							<span className="text-sm font-semibold">AH</span>
						</div>
						<span className="hidden text-base font-semibold md:inline">
							Algo Hire
						</span>
					</Link>
				</div>

				{/* Desktop Nav */}
				{/* <div className="hidden items-center gap-6 md:flex">
					<Link
						href="/dashboard"
						className="text-sm text-zinc-700 hover:text-black">
						Dashboard
					</Link>
					<Link
						href="/candidates"
						className="text-sm text-zinc-700 hover:text-black">
						Candidates
					</Link>
					<Link
						href="/about"
						className="text-sm text-zinc-700 hover:text-black">
						About
					</Link>
				</div> */}

				{/* Right: Auth */}
				<div className="hidden md:block">
					<AuthActions />
				</div>
				{/* Mobile hamburger */}
				<button
					aria-label="Toggle menu"
					onClick={() => setOpen((v) => !v)}
					className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 md:hidden">
					<svg
						className="h-5 w-5 text-zinc-700"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor">
						{open ? (
							<path
								strokeWidth="2"
								strokeLinecap="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						) : (
							<path
								strokeWidth="2"
								strokeLinecap="round"
								d="M3 6h18M3 12h18M3 18h18"
							/>
						)}
					</svg>
				</button>
			</nav>

			{/* Mobile menu */}
			{open && (
				<div className="border-t border-zinc-200 bg-white md:hidden">
					<div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3">
						{/* <Link
							href="/dashboard"
							onClick={() => setOpen(false)}
							className="rounded-md px-2 py-2 text-sm hover:bg-zinc-50">
							Dashboard
						</Link>
						<Link
							href="/candidates"
							onClick={() => setOpen(false)}
							className="rounded-md px-2 py-2 text-sm hover:bg-zinc-50">
							Candidates
						</Link>
						<Link
							href="/about"
							onClick={() => setOpen(false)}
							className="rounded-md px-2 py-2 text-sm hover:bg-zinc-50">
							About
						</Link> */}
						{/* Auth block on mobile */}
						<div className="mt-2 md:border-t border-zinc-200 pt-3">
							<AuthActions />
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
