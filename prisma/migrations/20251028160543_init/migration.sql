/*
  Warnings:

  - You are about to drop the column `classId` on the `Student` table. All the data in the column will be lost.
  - Added the required column `class_id` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_classId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "classId",
ADD COLUMN     "class_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
