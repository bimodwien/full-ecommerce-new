-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "midtransOrderId" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentType" TEXT,
ADD COLUMN     "snapRedirectUrl" TEXT,
ADD COLUMN     "snapToken" TEXT,
ADD COLUMN     "transactionStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_midtransOrderId_key" ON "orders"("midtransOrderId");

-- CreateIndex
CREATE INDEX "orders_midtransOrderId_idx" ON "orders"("midtransOrderId");

