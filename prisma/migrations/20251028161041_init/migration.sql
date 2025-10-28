/*
  Warnings:

  - Added the required column `title` to the `Guardian` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Guardian" ADD COLUMN     "title" TEXT NOT NULL;
