// app/candidates/[id]/page.tsx
import prisma from "@/lib/prisma";
import ChatRoom from "@/components/candidates/ChatRoom";

export default async function CandidateRoomPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const candidate = await prisma.candidate.findUnique({
		where: { id },
		select: { id: true, name: true, email: true },
	});

	if (!candidate) {
		return <div className="p-6 text-sm text-red-500">Candidate not found.</div>;
	}

	const notesFromDb = await prisma.note.findMany({
		where: { candidateId: candidate.id },
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			content: true,
			createdAt: true,
			author: { select: { id: true, name: true, email: true, username: true } },
		},
	});
	type NoteFromDb = {
		id: string;
		content: string;
		createdAt: Date;
		author: { id: string; name: string; email: string; username: string };
	};
	const notes = notesFromDb.map((note: NoteFromDb) => ({
		...note,
		createdAt: note.createdAt.toISOString(),
	}));

	return (
		<main className="mx-auto max-w-3xl px-4 py-6 md:px-6">
			<header className="mb-4">
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
					{candidate.name}
				</h1>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					{candidate.email}
				</p>
			</header>

			<ChatRoom candidateId={candidate.id} initialNotes={notes} />
		</main>
	);
}
