-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('RAFFERMIR', 'PRISE_MASSE', 'PERTE_POIDS', 'SE_MUSCLER');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'CONFIRME');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('UNE_DEUX', 'TROIS_QUATRE', 'CINQ_PLUS');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "CoachingPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" "Goal",
    "level" "Level",
    "frequency" "Frequency",
    "eatsMeat" BOOLEAN,
    "eatsFish" BOOLEAN,
    "eatsEggs" BOOLEAN,
    "veggies" TEXT[],
    "starches" TEXT[],
    "drinks" TEXT[],
    "dietaryRestrictions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachingPreferences_userId_key" ON "CoachingPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "CoachingPreferences" ADD CONSTRAINT "CoachingPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
