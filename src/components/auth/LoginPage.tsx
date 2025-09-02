"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [isDark, setIsDark] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<{ root?: string }>({});
	const router = useRouter();
	// Apply/remove the 'dark' class on the <html> element
	useEffect(() => {
		const root = document.documentElement;
		if (isDark) root.classList.add("dark");
		else root.classList.remove("dark");
	}, [isDark]);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setErrors({});
		setIsSubmitting(true);

		const form = new FormData(e.currentTarget);
		const email = (form.get("email") as string)?.trim();
		const password = (form.get("password") as string) ?? "";

		if (!email || !password) {
			setErrors({ root: "Please enter your email and password." });
			setIsSubmitting(false);
			return;
		}

		try {
			const res = await signIn("credentials", {
				redirect: false,
				email,
				password,
			});

			if (res?.error) {
				setErrors({ root: "Invalid credentials." });
				return;
			}

			// success
			// router.push("/dashboard") or wherever
			// (useRouter at top: const router = useRouter();)
			router.push("/dashboard");
		} catch {
			setErrors({ root: "Something went wrong. Try again." });
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-[#0b0b0b] dark:text-neutral-100 selection:bg-black/80 selection:text-white dark:selection:bg-white/90 dark:selection:text-black">
			{/* background accents */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 -z-10 opacity-[0.2] blur-[80px]"
				style={{
					background:
						"radial-gradient(600px 300px at 80% 10%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(600px 300px at 20% 90%, rgba(236,72,153,0.35), transparent 60%)",
				}}
			/>
			<header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:py-6">
				<div className="flex items-center gap-2">
					<div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 shadow-lg" />
					<span className="text-lg font-semibold tracking-tight">YourApp</span>
				</div>

				{/* Theme toggle */}
				<button
					onClick={() => setIsDark((v) => !v)}
					className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm transition hover:bg-neutral-50 active:scale-[0.98] dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
					aria-label="Toggle theme">
					<span className="block h-4 w-4 rounded-full bg-neutral-900 transition group-hover:scale-110 dark:bg-white" />
					<span className="hidden sm:block">
						{isDark ? "Dark" : "Light"} mode
					</span>
				</button>
			</header>

			<main className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-6 md:grid-cols-2">
				{/* Left: marketing/branding blurb */}
				<section className="order-2 md:order-1">
					<h1 className="text-3xl font-bold leading-tight sm:text-4xl">
						Welcome back
					</h1>
					<p className="mt-3 max-w-md text-sm text-neutral-600 dark:text-neutral-300">
						Sign in to access your dashboard, collaborate with your team, and
						continue where you left off.
					</p>

					<ul className="mt-6 grid gap-3 text-sm text-neutral-700 dark:text-neutral-300 sm:grid-cols-2">
						<li className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
							• Secure authentication
						</li>
						<li className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
							• Real-time updates
						</li>
						<li className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
							• Team collaboration
						</li>
						<li className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
							• Powerful analytics
						</li>
					</ul>
				</section>

				{/* Right: Auth card */}
				<section className="order-1 md:order-2">
					<div className="mx-auto w-full max-w-md rounded-2xl border border-black/10 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-8">
						<h2 className="text-xl font-semibold">Sign in</h2>
						<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
							Use your email/username and password.
						</p>

						<form onSubmit={onSubmit} className="mt-6 space-y-4">
							{errors.root && (
								<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
									{errors.root}
								</div>
							)}

							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium">
									Email
								</label>
								<input
									id="email"
									name="email"
									type="text"
									autoComplete="username email"
									placeholder="you@example.com or @username"
									className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/10"
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<label htmlFor="password" className="text-sm font-medium">
										Password
									</label>
									<a
										href="/forgot-password"
										className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
										Forgot?
									</a>
								</div>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									placeholder="••••••••"
									className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/10"
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="flex cursor-pointer items-center gap-2 text-sm">
									<input
										type="checkbox"
										name="remember"
										className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-600"
									/>
									Remember me
								</label>
							</div>

							<button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70">
								{isSubmitting ? (
									<span className="inline-flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
										Signing in…
									</span>
								) : (
									"Sign in"
								)}
							</button>

							{/* OAuth (optional) */}
							{/* <div className="relative py-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
								<span className="relative bg-white px-2 dark:bg-transparent">
									or
								</span>
								<div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-neutral-200 dark:bg-white/10" />
							</div> */}

							{/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<button
									type="button"
									// onClick={() => signIn("google")}
									className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
									Continue with Google
								</button>
								<button
									type="button"
									// onClick={() => signIn("github")}
									className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
									Continue with GitHub
								</button>
							</div> */}
						</form>

						<p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-300">
							Don’t have an account?{" "}
							<a
								href="/register"
								className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
								Sign up
							</a>
						</p>
					</div>
				</section>
			</main>
		</div>
	);
}
