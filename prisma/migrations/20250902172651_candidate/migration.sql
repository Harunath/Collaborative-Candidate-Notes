/*
  Warnings:

  - Made the column `email` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `Candidate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Candidate" DROP CONSTRAINT "Candidate_createdById_fkey";

-- AlterTable
ALTER TABLE "public"."Candidate" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "createdById" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_username_idx" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
