// lib/notifications.ts
import prisma from "@/lib/prisma";

export async function createMentionNotifications(opts: {
	candidateId: string;
	noteId: string;
	mentionedUserIds: string[];
	preview: string; // <= 200 chars
}) {
	const { candidateId, noteId, mentionedUserIds, preview } = opts;

	if (!mentionedUserIds.length) return;

	const data = mentionedUserIds.map((userId) => ({
		userId,
		candidateId,
		noteId,
		preview: preview.slice(0, 200),
	}));

	// Upsert one per user/note (durable)
	await Promise.all(
		data.map((d) =>
			prisma.notification.upsert({
				where: { userId_noteId: { userId: d.userId, noteId: d.noteId } }, // composite unique
				create: d,
				update: { preview: d.preview, createdAt: new Date(), readAt: null },
			})
		)
	);

	// Realtime fan-out via Pusher
	try {
		const { pusherServer } = await import("@/lib/pusher");
		await Promise.all(
			mentionedUserIds.map((uid) =>
				pusherServer.trigger(`user:${uid}`, "notification:new", {
					candidateId,
					noteId,
					preview: preview.slice(0, 200),
				})
			)
		);
	} catch {}
}
