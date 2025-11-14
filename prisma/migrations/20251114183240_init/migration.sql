-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('Active', 'Inactive');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'Active';
