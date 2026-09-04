-- DropIndex
DROP INDEX "Event_startsAt_idx";

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_eventId_idx" ON "Booking"("eventId");

-- CreateIndex
CREATE INDEX "Event_startsAt_id_idx" ON "Event"("startsAt", "id");

-- CreateIndex
CREATE INDEX "Hold_userId_idx" ON "Hold"("userId");

-- CreateIndex
CREATE INDEX "Hold_eventId_idx" ON "Hold"("eventId");
