import { redirect } from "next/navigation";

export default function Page() {
	// Immediately redirect on the server
	redirect("/dashboard");
}
