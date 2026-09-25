-- Old orders were single-seller test data with no payment row, wipe them
-- so the new required sellerId/paymentId columns can be added.
DELETE FROM "order_items";
DELETE FROM "orders";

-- DropIndex
DROP INDEX "orders_midtransOrderId_idx";

-- DropIndex
DROP INDEX "orders_midtransOrderId_key";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "midtransOrderId",
DROP COLUMN "paidAt",
DROP COLUMN "paymentType",
DROP COLUMN "snapRedirectUrl",
DROP COLUMN "snapToken",
DROP COLUMN "transactionStatus",
ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "sellerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "midtransOrderId" TEXT,
    "snapToken" TEXT,
    "snapRedirectUrl" TEXT,
    "paymentType" TEXT,
    "transactionStatus" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_midtransOrderId_key" ON "payments"("midtransOrderId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "orders_sellerId_idx" ON "orders"("sellerId");

-- CreateIndex
CREATE INDEX "orders_paymentId_idx" ON "orders"("paymentId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

