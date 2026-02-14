-- DropIndex
DROP INDEX "public"."Booking_branchId_slotAt_key";

-- CreateTable
CREATE TABLE "public"."SlotReservation" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "slotAt" TIMESTAMP(3) NOT NULL,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "SlotReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlotReservation_bookingId_key" ON "public"."SlotReservation"("bookingId");

-- CreateIndex
CREATE INDEX "SlotReservation_branchId_slotAt_idx" ON "public"."SlotReservation"("branchId", "slotAt");

-- CreateIndex
CREATE UNIQUE INDEX "SlotReservation_branchId_slotAt_key" ON "public"."SlotReservation"("branchId", "slotAt");

-- AddForeignKey
ALTER TABLE "public"."SlotReservation" ADD CONSTRAINT "SlotReservation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SlotReservation" ADD CONSTRAINT "SlotReservation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
