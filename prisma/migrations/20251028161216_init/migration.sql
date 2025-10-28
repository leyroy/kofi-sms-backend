/*
  Warnings:

  - Added the required column `relationship` to the `Guardian` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Guardian" ADD COLUMN     "relationship" TEXT NOT NULL;
