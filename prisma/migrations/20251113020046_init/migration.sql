/*
  Warnings:

  - Added the required column `paidAmount` to the `FeePayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeePayment" ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "paidDate" SET DEFAULT CURRENT_TIMESTAMP;
