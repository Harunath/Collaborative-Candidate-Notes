"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FieldErrors = Record<string, string[]>;
type ApiResponse =
	| { ok: true; userId: string }
	| { ok: false; errors?: FieldErrors; message?: string };

export default function RegisterPage() {
	const router = useRouter();
	const [isDark, setIsDark] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<FieldErrors>({});

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
		const name = (form.get("name") as string)?.trim();
		const email = (form.get("email") as string)?.trim().toLowerCase();
		const username = (form.get("username") as string)?.trim();
		const password = (form.get("password") as string) ?? "";
		const confirm = (form.get("confirm") as string) ?? "";

		if (password !== confirm) {
			setErrors({ confirm: ["Passwords do not match"] });
			setIsSubmitting(false);
			return;
		}

		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, username, password }),
			});

			const data = (await res.json()) as ApiResponse;

			if (!res.ok || !("ok" in data) || !data.ok) {
				setErrors(
					"errors" in data && data.errors
						? data.errors
						: {
								_server: [
									("message" in data && data.message) || "Registration failed",
								],
						  }
				);
				return;
			}

			// success → go to login or dashboard
			router.push("/login");
		} catch {
			setErrors({ _server: ["Something went wrong. Try again."] });
		} finally {
			setIsSubmitting(false);
		}
	}

	function Err({ name }: { name: string }) {
		const msgs = errors?.[name];
		if (!msgs || !msgs.length) return null;
		return <p className="text-xs text-red-600 dark:text-red-400">{msgs[0]}</p>;
	}

	return (
		<div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-[#0b0b0b] dark:text-neutral-100 selection:bg-black/80 selection:text-white dark:selection:bg-white/90 dark:selection:text-black">
			{/* soft glow bg */}
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
				{/* Left: blurb */}
				<section className="order-2 md:order-1">
					<h1 className="text-3xl font-bold leading-tight sm:text-4xl">
						Create your account
					</h1>
					<p className="mt-3 max-w-md text-sm text-neutral-600 dark:text-neutral-300">
						Join to access your dashboard, collaborate in real-time, and keep
						everything organized.
					</p>

					<ul className="mt-6 grid gap-3 text-sm text-neutral-700 dark:text-neutral-300 sm:grid-cols-2">
						<li className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
							• Email & phone uniqueness
						</li>
						<li className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
							• Strong password hashing
						</li>
						<li className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
							• NextAuth-ready
						</li>
						<li className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
							• Built for speed
						</li>
					</ul>
				</section>

				{/* Right: form card */}
				<section className="order-1 md:order-2">
					<div className="mx-auto w-full max-w-md rounded-2xl border border-black/10 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-8">
						<h2 className="text-xl font-semibold">Sign up</h2>
						<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
							Fill in your details to get started.
						</p>

						{/* Global/server error */}
						{errors?._server && (
							<div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
								{errors._server[0]}
							</div>
						)}

						<form onSubmit={onSubmit} className="mt-6 space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<label htmlFor="name" className="text-sm font-medium">
										Full name
									</label>
									<input
										id="name"
										name="name"
										type="text"
										placeholder="Harunath Eskuri"
										className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/10"
									/>
									<Err name="name" />
								</div>

								<div className="space-y-1">
									<label htmlFor="username" className="text-sm font-medium">
										Username
									</label>
									<input
										id="username"
										name="username"
										type="text"
										placeholder="harunath"
										className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/10"
									/>
									<Err name="username" />
								</div>
							</div>

							<div className="space-y-1">
								<label htmlFor="email" className="text-sm font-medium">
									Email
								</label>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									placeholder="you@example.com"
									className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/10"
								/>
								<Err name="email" />
							</div>

							{/* <div className="space-y-1">
								<label htmlFor="phone" className="text-sm font-medium">
									Phone
								</label>
								<input
									id="phone"
									name="phone"
									type="tel"
									placeholder="+91 98765 43210"
									className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/10"
								/>
								<Err name="phone" />
							</div> */}

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<label htmlFor="password" className="text-sm font-medium">
										Password
									</label>
									<input
										id="password"
										name="password"
										type="password"
										placeholder="••••••••"
										className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/10"
									/>
									<Err name="password" />
								</div>

								<div className="space-y-1">
									<label htmlFor="confirm" className="text-sm font-medium">
										Confirm password
									</label>
									<input
										id="confirm"
										name="confirm"
										type="password"
										placeholder="••••••••"
										className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/10"
									/>
									<Err name="confirm" />
								</div>
							</div>

							{/* backend field errors */}
							<Err name="username" />
							<Err name="email" />
							<Err name="phone" />

							<button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70">
								{isSubmitting ? (
									<span className="inline-flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
										Creating account…
									</span>
								) : (
									"Create account"
								)}
							</button>

							<p className="text-center text-sm text-neutral-600 dark:text-neutral-300">
								Already have an account?{" "}
								<a
									href="/login"
									className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
									Sign in
								</a>
							</p>
						</form>
					</div>
				</section>
			</main>
		</div>
	);
}
