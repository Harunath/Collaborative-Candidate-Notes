import "next-auth";
declare module "next-auth" {
	interface User {
		id: string;
		email: string; // Explicitly define email as always available
		name: string;
		username: string;
	}

	interface Session {
		user: User; // Link the extended User type here
	}
}
