import NextAuth, { NextAuthOptions } from "next-auth";
import { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Invalid email or password");
				}
				const user = await prisma.user.findFirst({
					where: { email: credentials.email },
					select: {
						id: true,
						email: true,
						passwordHash: true,
						name: true,
						username: true,
					},
				});
				if (user) {
					// Verify password
					const isValidPassword = await bcrypt.compare(
						credentials.password,
						user.passwordHash
					);
					if (!isValidPassword) {
						throw new Error("Invalid password");
					}
					return {
						id: user.id,
						email: user.email,
						name: user.name,
						username: user.username,
					};
				}
				return null;
			},
		}),
	],
	callbacks: {
		async signIn({ user }) {
			// Check if user already exists in the database
			const recruiter = await prisma.user.findUnique({
				where: {
					email: user.email!,
				},
			});

			// If user doesn't exist, create a new record
			if (recruiter) {
				return true;
			}
			return "/unauthorized";
		},
		async redirect({ baseUrl }) {
			return baseUrl + "/login";
		},
		async jwt({ token, user }) {
			if (user && user.email) {
				const recruiter = await prisma.user.findFirst({
					where: { email: user.email },
					select: {
						id: true,
						email: true,
						name: true,
						username: true,
					},
				});
				if (recruiter) {
					token.id = recruiter?.id;
					token.email = recruiter?.email;
					token.name = recruiter?.name;
					token.lastName = recruiter?.username;
				}
			}
			return token;
		},

		async session({ session, token }: { session: Session; token: JWT }) {
			if (session.user && token) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
				session.user.username = token.lastName as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
	secret: process.env.NEXTAUTH_SECRET!,
};

export default NextAuth(authOptions);
