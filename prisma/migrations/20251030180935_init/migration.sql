/*
  Warnings:

  - You are about to drop the column `balance` on the `FeePayment` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `FeePayment` table. All the data in the column will be lost.
  - Added the required column `studentId` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termId` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feesId` to the `Terms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."FeePayment" DROP CONSTRAINT "FeePayment_feeId_fkey";

-- AlterTable
ALTER TABLE "FeePayment" DROP COLUMN "balance",
DROP COLUMN "paidAmount",
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "termId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Terms" ADD COLUMN     "feesId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "Fee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
