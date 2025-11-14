-- AlterTable
ALTER TABLE "Terms" ADD COLUMN     "isFeesGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "termStatus" NOT NULL DEFAULT 'Upcoming';
