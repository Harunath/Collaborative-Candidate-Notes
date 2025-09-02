// app/api/notifications/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: Params) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id)
		return NextResponse.json({ ok: false }, { status: 401 });
	const { id } = await params;
	const n = await prisma.notification.update({
		where: { id },
		data: { readAt: new Date() },
		select: { id: true, userId: true },
	});

	if (n.userId !== session.user.id) {
		return NextResponse.json({ ok: false }, { status: 403 });
	}

	try {
		const { pusherServer } = await import("@/lib/pusher");
		await pusherServer.trigger(`user:${session.user.id}`, "notification:read", {
			id: n.id,
		});
	} catch {}

	return NextResponse.json({ ok: true });
}
