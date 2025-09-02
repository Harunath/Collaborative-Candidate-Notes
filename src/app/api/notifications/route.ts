// app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth"; // your NextAuth options export
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id)
		return NextResponse.json({ ok: false }, { status: 401 });

	const { searchParams } = new URL(req.url);
	const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
	const cursor = searchParams.get("cursor") ?? undefined;
	const onlyUnread = searchParams.get("unread") === "1";

	const items = await prisma.notification.findMany({
		where: {
			userId: session.user.id as string,
			...(onlyUnread ? { readAt: null } : {}),
		},
		take: limit + 1,
		...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			candidateId: true,
			noteId: true,
			preview: true,
			createdAt: true,
			readAt: true,
			candidate: { select: { id: true, name: true } },
		},
	});

	const hasMore = items.length > limit;
	const data = hasMore ? items.slice(0, -1) : items;

	const unreadCount = await prisma.notification.count({
		where: { userId: session.user.id as string, readAt: null },
	});

	return NextResponse.json({
		ok: true,
		items: data,
		nextCursor: hasMore ? items[items.length - 1].id : null,
		unreadCount,
	});
}

export async function PATCH(req: Request) {
	// Mark-all-read
	const session = await getServerSession(authOptions);
	if (!session?.user?.id)
		return NextResponse.json({ ok: false }, { status: 401 });

	await prisma.notification.updateMany({
		where: { userId: session.user.id as string, readAt: null },
		data: { readAt: new Date() },
	});

	// Optional: ping Pusher to update badge on other tabs/devices
	try {
		const { pusherServer } = await import("@/lib/pusher");
		await pusherServer.trigger(
			`user:${session.user.id}`,
			"notification:read_all",
			{}
		);
	} catch {}

	return NextResponse.json({ ok: true });
}
