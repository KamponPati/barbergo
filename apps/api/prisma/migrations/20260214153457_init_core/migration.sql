-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('customer', 'partner', 'admin');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "public"."PartnerVerificationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."ServiceMode" AS ENUM ('in_shop', 'delivery');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('requested', 'quoted', 'authorized', 'confirmed', 'started', 'completed', 'cancelled', 'disputed');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('authorized', 'captured', 'refunded');

-- CreateEnum
CREATE TYPE "public"."WithdrawalStatus" AS ENUM ('requested', 'approved', 'paid', 'rejected');

-- CreateEnum
CREATE TYPE "public"."DisputeStatus" AS ENUM ('opened', 'investigating', 'resolved', 'rejected');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Partner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verificationStatus" "public"."PartnerVerificationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shop" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Branch" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "openHours" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "mode" "public"."ServiceMode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Staff" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StaffSkill" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,

    CONSTRAINT "StaffSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "slotAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."BookingStatus" NOT NULL,
    "amount" INTEGER NOT NULL,
    "quoteAmount" INTEGER NOT NULL,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingEvent" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statusFrom" "public"."BookingStatus",
    "statusTo" "public"."BookingStatus",
    "message" TEXT,
    "actorUserId" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "providerRef" TEXT,
    "status" "public"."PaymentStatus" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LedgerEntry" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "bookingId" TEXT,
    "direction" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Withdrawal" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "public"."WithdrawalStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Dispute" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "openedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "public"."DisputeStatus" NOT NULL DEFAULT 'opened',
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PartnerDocument" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "rotatedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT,
    "requestId" TEXT,
    "path" TEXT,
    "method" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "public"."Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_userId_key" ON "public"."Partner"("userId");

-- CreateIndex
CREATE INDEX "Shop_partnerId_idx" ON "public"."Shop"("partnerId");

-- CreateIndex
CREATE INDEX "Branch_shopId_idx" ON "public"."Branch"("shopId");

-- CreateIndex
CREATE INDEX "Branch_zone_idx" ON "public"."Branch"("zone");

-- CreateIndex
CREATE INDEX "Service_shopId_idx" ON "public"."Service"("shopId");

-- CreateIndex
CREATE INDEX "Staff_shopId_idx" ON "public"."Staff"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffSkill_staffId_skill_key" ON "public"."StaffSkill"("staffId", "skill");

-- CreateIndex
CREATE INDEX "Booking_customerId_createdAt_idx" ON "public"."Booking"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_partnerId_status_idx" ON "public"."Booking"("partnerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_branchId_slotAt_key" ON "public"."Booking"("branchId", "slotAt");

-- CreateIndex
CREATE INDEX "BookingEvent_bookingId_createdAt_idx" ON "public"."BookingEvent"("bookingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "public"."Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_partnerId_key" ON "public"."Wallet"("partnerId");

-- CreateIndex
CREATE INDEX "LedgerEntry_partnerId_createdAt_idx" ON "public"."LedgerEntry"("partnerId", "createdAt");

-- CreateIndex
CREATE INDEX "Withdrawal_partnerId_createdAt_idx" ON "public"."Withdrawal"("partnerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "public"."Review"("bookingId");

-- CreateIndex
CREATE INDEX "Review_shopId_createdAt_idx" ON "public"."Review"("shopId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_bookingId_key" ON "public"."Dispute"("bookingId");

-- CreateIndex
CREATE INDEX "PartnerDocument_partnerId_createdAt_idx" ON "public"."PartnerDocument"("partnerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_refreshToken_key" ON "public"."AuthSession"("refreshToken");

-- CreateIndex
CREATE INDEX "AuthSession_userId_createdAt_idx" ON "public"."AuthSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "public"."AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "public"."AuditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Partner" ADD CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shop" ADD CONSTRAINT "Shop_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Branch" ADD CONSTRAINT "Branch_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffSkill" ADD CONSTRAINT "StaffSkill_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingEvent" ADD CONSTRAINT "BookingEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Withdrawal" ADD CONSTRAINT "Withdrawal_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dispute" ADD CONSTRAINT "Dispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartnerDocument" ADD CONSTRAINT "PartnerDocument_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
