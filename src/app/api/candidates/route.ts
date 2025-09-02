// app/api/candidates/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma"; // <- adjust if your prisma path differs
import { authOptions } from "@/lib/auth/auth"; // <- adjust if your auth path differs
import { createCandidateSchema } from "@/lib/validation/candidate";
import { Prisma } from "@prisma/client";

const PAGE_SIZE_DEFAULT = 10;

// app/api/candidates/route.ts

export async function GET(req: Request) {
	const url = new URL(req.url);
	const q = (url.searchParams.get("q") ?? "").trim();
	const limitParam = Number(url.searchParams.get("limit") ?? PAGE_SIZE_DEFAULT);
	const limit = Number.isFinite(limitParam)
		? Math.min(limitParam, 50)
		: PAGE_SIZE_DEFAULT;
	const cursor = url.searchParams.get("cursor"); // candidate.id

	const where: Prisma.CandidateWhereInput = q
		? {
				OR: [
					{ name: { contains: q, mode: Prisma.QueryMode.insensitive } },
					{ email: { contains: q, mode: Prisma.QueryMode.insensitive } },
				],
		  }
		: {};

	const items = await prisma.candidate.findMany({
		where,
		orderBy: { createdAt: "desc" },
		take: limit + 1,
		...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
		select: {
			id: true,
			name: true,
			email: true,
			createdAt: true,
			createdById: true,
		},
	});

	let nextCursor: string | null = null;
	if (items.length > limit) {
		const next = items.pop();
		nextCursor = next?.id ?? null;
	}

	return NextResponse.json({ ok: true, items, nextCursor });
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json(
			{ ok: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	const body = await req.json();
	const parsed = createCandidateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const { name, email } = parsed.data;

	const created = await prisma.candidate.create({
		data: {
			name,
			email,
			createdById: session.user.id,
		},
		select: {
			id: true,
			name: true,
			email: true,
			createdAt: true,
			createdById: true,
		},
	});

	return NextResponse.json({ ok: true, item: created }, { status: 201 });
}
