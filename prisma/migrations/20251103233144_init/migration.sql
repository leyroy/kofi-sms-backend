/*
  Warnings:

  - Added the required column `accademicYear` to the `Terms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Terms" ADD COLUMN     "accademicYear" TEXT NOT NULL;
