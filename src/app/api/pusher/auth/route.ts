// app/api/pusher/auth/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json(
			{ ok: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	const body = await req.formData();
	const socket_id = String(body.get("socket_id") ?? "");
	const channel_name = String(body.get("channel_name") ?? "");

	// presence requires a unique user_id; we’ll use session.user.id
	const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
		user_id: session.user.id,
		user_info: {
			name: session.user.name,
			email: session.user.email,
		},
	});

	return new NextResponse(JSON.stringify(authResponse), { status: 200 });
}
