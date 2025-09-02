// app/api/users/search/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // your prisma helper

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const q = (searchParams.get("q") ?? "").trim();
	if (!q) return NextResponse.json({ items: [] });

	const items = await prisma.user.findMany({
		where: {
			OR: [
				{ username: { startsWith: q, mode: "insensitive" } },
				{ name: { contains: q, mode: "insensitive" } },
			],
		},
		select: { id: true, name: true, username: true, image: true },
		take: 8,
		orderBy: [{ username: "asc" }],
	});

	return NextResponse.json({ items });
}
