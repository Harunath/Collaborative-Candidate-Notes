import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth/auth"; // your NextAuth options
import { z } from "zod";
import { toastErr, toastOK } from "@/lib/toast";

const NameSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
});

export default async function ProfilePage() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) redirect("/login");

	// Always read fresh data from DB so updates reflect immediately
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { name: true, email: true },
	});

	if (!user) redirect("/login");

	async function updateName(formData: FormData) {
		"use server";
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) redirect("/login");

		const parsed = NameSchema.safeParse({
			name: formData.get("name")?.toString() || "",
		});
		if (!parsed.success) {
			// Basic guard—on failure just re-render with a query param
			redirect("/profile?error=name");
		}

		await prisma.user.update({
			where: { id: session.user.id },
			data: { name: parsed.data.name.trim() },
		});

		// Revalidate this page and return
		revalidatePath("/profile");
		redirect("/profile?updated=1");
	}

	return (
		<div className="mx-auto max-w-xl px-4 py-10">
			<h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

			<div className="mt-6 rounded-xl border border-black/10 dark:border-white/10 p-6">
				<div className="space-y-3">
					<div className="text-sm text-gray-500">Email</div>
					<div className="text-base font-medium">{user.email}</div>
				</div>

				<form action={updateName} className="mt-8 space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium">
							Name
						</label>
						<input
							id="name"
							name="name"
							defaultValue={user.name ?? ""}
							required
							className="mt-2 w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
							placeholder="Your name"
						/>
						{/* Optional: read URL flags to show simple messages */}
						{/* You can read searchParams in this component if you want to show errors */}
					</div>

					<button
						type="submit"
						className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-black text-white hover:bg-black/90 disabled:opacity-50">
						Save
					</button>
				</form>
			</div>
		</div>
	);
}
