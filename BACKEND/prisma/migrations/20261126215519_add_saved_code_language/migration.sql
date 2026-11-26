/*
  Warnings:

  - A unique constraint covering the columns `[userId,problemId,language]` on the table `SavedCode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SavedCode_userId_problemId_key";

-- AlterTable
ALTER TABLE "SavedCode" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'java';

-- CreateIndex
CREATE UNIQUE INDEX "SavedCode_userId_problemId_language_key" ON "SavedCode"("userId", "problemId", "language");
