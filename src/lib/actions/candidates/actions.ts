// app/(dashboard)/candidates/[id]/actions.ts
"use server";

import prisma from "@/lib/prisma";
import Pusher from "pusher";
import { revalidatePath } from "next/cache";

const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID!,
	key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
	secret: process.env.PUSHER_SECRET!,
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
	useTLS: true,
});

export async function sendNote(
	candidateId: string,
	text: string,
	authorId: string
) {
	if (!text.trim()) return { ok: false, message: "Empty." };

	// 1) store note
	const note = await prisma.note.create({
		data: { candidateId, authorId, content: text },
	});

	// 2) extract @mentions
	const usernames = Array.from(
		new Set((text.match(/@([\w-]+)/g) ?? []).map((s) => s.slice(1)))
	);
	if (usernames.length) {
		const users = await prisma.user.findMany({
			where: { username: { in: usernames } },
			select: { id: true, username: true },
		});

		// 3) store mentions + notifications
		const candidate = await prisma.candidate.findUnique({
			where: { id: candidateId },
			select: { name: true },
		});
		const preview = text.slice(0, 120);

		await prisma.$transaction(async (tx) => {
			for (const u of users) {
				await tx.mention.create({
					data: { noteId: note.id, mentionedUserId: u.id }, // your Mention model
				});
				await tx.notification.upsert({
					where: { userId_noteId: { userId: u.id, noteId: note.id } }, // unique(userId, noteId)
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

		// 4) realtime ping per mentioned user
		await Promise.all(
			users.map((u) =>
				pusher.trigger(`private-user-${u.id}`, "mention", {
					candidateId,
					candidateName: candidate?.name ?? "Candidate",
					noteId: note.id,
					preview,
				})
			)
		);
	}

	// 5) broadcast new note to the candidate room (optional)
	await pusher.trigger(`presence-candidate-${candidateId}`, "note:new", {
		noteId: note.id,
	});

	revalidatePath(`/candidates/${candidateId}`);
	return { ok: true, message: "Sent!", noteId: note.id };
}
