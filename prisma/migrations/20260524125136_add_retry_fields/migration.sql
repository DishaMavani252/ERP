-- AlterTable
ALTER TABLE "SyncLog" ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
