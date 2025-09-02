// lib/validation/candidate.ts
import { z } from "zod";

export const createCandidateSchema = z.object({
	name: z.string().min(2, "Name is required"),
	email: z.string().email().toLowerCase(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
