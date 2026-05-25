-- CreateTable
CREATE TABLE "SyncLog" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "productId" TEXT,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);
