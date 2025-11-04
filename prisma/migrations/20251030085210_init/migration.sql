/*
  Warnings:

  - You are about to drop the column `indexNumber` on the `Class` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[indexNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `indexNumber` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Class_indexNumber_key";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "indexNumber";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "indexNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_indexNumber_key" ON "Student"("indexNumber");
