-- CreateTable
CREATE TABLE "ProductMapping" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "shopifyProductId" TEXT NOT NULL,
    "erpProductId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductMapping_shopifyProductId_key" ON "ProductMapping"("shopifyProductId");
