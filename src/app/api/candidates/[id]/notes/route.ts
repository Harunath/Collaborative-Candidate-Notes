// app/api/candidates/[id]/notes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import Pusher from "pusher";

const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID!,
	key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
	secret: process.env.PUSHER_SECRET!,
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
	useTLS: true,
});

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json(
			{ ok: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	const candidateId = (await params).id;
	const { content } = await req.json();
	const text = (content ?? "").trim();
	if (!text)
		return NextResponse.json({ ok: false, error: "Empty" }, { status: 400 });

	// 1) Create the note (include author for broadcast payload)
	const note = await prisma.note.create({
		data: {
			content: text,
			candidateId,
			authorId: session.user.id,
		},
		include: {
			author: { select: { id: true, name: true, email: true, username: true } },
		},
	});

	// 2) Extract unique @usernames
	const usernames: string[] = Array.from(
		new Set(
			(text.match(/@([\w-]+)/g) ?? []).map((s: string) => s.slice(1) as string)
		)
	);

	if (usernames.length) {
		// Resolve usernames -> users
		const users = await prisma.user.findMany({
			where: { username: { in: usernames } },
			select: { id: true, username: true },
		});

		const preview = text.slice(0, 200);

		await prisma.$transaction(async (tx) => {
			for (const u of users) {
				// 3) Store mention row
				await tx.mention.upsert({
					where: {
						noteId_mentionedUserId: { noteId: note.id, mentionedUserId: u.id },
					},
					create: { noteId: note.id, mentionedUserId: u.id },
					update: {},
				});

				// 4) Upsert durable notification (if you modeled it)
				await tx.notification?.upsert?.({
					where: { userId_noteId: { userId: u.id, noteId: note.id } },
					create: {
						userId: u.id,
						candidateId,
						noteId: note.id,
						preview,
					},
					update: {},
				});
			}
		});

		// 5) Ping each mentioned user
		await Promise.all(
			users.map((u) =>
				pusher.trigger(`private-user-${u.id}`, "mention", {
					candidateId,
					noteId: note.id,
					preview,
				})
			)
		);
	}

	// 6) Broadcast message to the candidate room (what your ChatRoom listens to)
	await pusher.trigger(`presence-candidate-${candidateId}`, "message:new", {
		id: note.id,
		content: note.content,
		createdAt: note.createdAt,
		author: note.author,
	});

	return NextResponse.json({ ok: true, noteId: note.id });
}
