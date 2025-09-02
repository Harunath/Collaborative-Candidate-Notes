import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma"; // <- keep this import path consistent with your project

// Adjust these to match your schema constraints (you mentioned phone is unique).
const registerSchema = z.object({
	name: z.string().min(2).max(100),
	email: z.string().email().toLowerCase(),
	username: z
		.string()
		.min(3)
		.max(24)
		.regex(/^[a-z0-9_\.]+$/i, "Only letters, numbers, underscore and dot"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsed = registerSchema.safeParse(body);
		if (!parsed.success) {
			const err = parsed.error.flatten().fieldErrors;
			return NextResponse.json({ ok: false, errors: err }, { status: 400 });
		}

		const { name, email, username, password } = parsed.data;

		// Pre-flight checks (fast feedback; DB still enforces uniqueness)
		const [emailExists, usernameExists] = await Promise.all([
			prisma.user.findUnique({ where: { email } }),
			prisma.user.findUnique({ where: { username } }),
		]);

		if (emailExists) {
			return NextResponse.json(
				{ ok: false, errors: { email: ["Email already in use"] } },
				{ status: 409 }
			);
		}
		if (usernameExists) {
			return NextResponse.json(
				{ ok: false, errors: { username: ["Username already taken"] } },
				{ status: 409 }
			);
		}

		const passwordHash = await bcrypt.hash(password, 12);

		// Atomic create of User + Account
		const user = await prisma.$transaction(async (tx) => {
			const createdUser = await tx.user.create({
				data: {
					name,
					email,
					username,
					passwordHash,
					// image: null, // set if you collect an avatar
				},
				select: { id: true },
			});

			// For Credentials provider, it’s fine to create an Account row so NextAuth
			// has a consistent shape with OAuth sign-ins.
			await tx.account.create({
				data: {
					userId: createdUser.id,
					type: "credentials",
					provider: "credentials",
					providerAccountId: createdUser.id, // could also use email
				},
			});

			return createdUser;
		});

		return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
	} catch (err) {
		// Prisma unique constraint violation safety net
		if (err instanceof Error) {
			return NextResponse.json(
				{ ok: false, errors: err.message },
				{ status: 500 }
			);
		}

		console.error("Register error:", err);
		return NextResponse.json(
			{ ok: false, errors: { _server: ["Unexpected error"] } },
			{ status: 500 }
		);
	}
}
