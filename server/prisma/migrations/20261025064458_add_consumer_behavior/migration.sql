-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('VIEW', 'CLICK', 'SELECT', 'SAVE', 'REDEEM');

-- CreateEnum
CREATE TYPE "ChoiceFactor" AS ENUM ('PRICE', 'DISCOUNT', 'DISTANCE', 'CROWD', 'QUEUE', 'BRAND_FAMILIARITY', 'CONVENIENCE', 'OTHER');

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountText" TEXT,
    "price" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumerInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "brandId" TEXT,
    "offerId" TEXT,
    "action" "InteractionType" NOT NULL,
    "factor" "ChoiceFactor",
    "rating" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumerInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brand_category_idx" ON "Brand"("category");

-- CreateIndex
CREATE INDEX "Brand_isActive_idx" ON "Brand"("isActive");

-- CreateIndex
CREATE INDEX "Offer_brandId_idx" ON "Offer"("brandId");

-- CreateIndex
CREATE INDEX "Offer_eventId_idx" ON "Offer"("eventId");

-- CreateIndex
CREATE INDEX "Offer_isActive_idx" ON "Offer"("isActive");

-- CreateIndex
CREATE INDEX "ConsumerInteraction_userId_idx" ON "ConsumerInteraction"("userId");

-- CreateIndex
CREATE INDEX "ConsumerInteraction_eventId_idx" ON "ConsumerInteraction"("eventId");

-- CreateIndex
CREATE INDEX "ConsumerInteraction_brandId_idx" ON "ConsumerInteraction"("brandId");

-- CreateIndex
CREATE INDEX "ConsumerInteraction_offerId_idx" ON "ConsumerInteraction"("offerId");

-- CreateIndex
CREATE INDEX "ConsumerInteraction_action_idx" ON "ConsumerInteraction"("action");

-- CreateIndex
CREATE INDEX "ConsumerInteraction_factor_idx" ON "ConsumerInteraction"("factor");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumerInteraction" ADD CONSTRAINT "ConsumerInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumerInteraction" ADD CONSTRAINT "ConsumerInteraction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumerInteraction" ADD CONSTRAINT "ConsumerInteraction_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumerInteraction" ADD CONSTRAINT "ConsumerInteraction_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
