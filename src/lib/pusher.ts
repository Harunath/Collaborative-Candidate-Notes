// lib/pusher.ts
import PusherServer from "pusher";
import Pusher from "pusher-js";

export const pusherServer = new PusherServer({
	appId: process.env.PUSHER_APP_ID!,
	key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
	secret: process.env.PUSHER_SECRET!,
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
	useTLS: true,
});

// (Client uses NEXT_PUBLIC_* directly in component)

export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
	forceTLS: true,
	authEndpoint: "/api/pusher/auth", // 👈 important
});
