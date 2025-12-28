-- AlterTable: Add unique constraint to stripeCustomerId and add plan field
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT;

-- CreateIndex: Add unique constraint to stripeCustomerId (if column exists and is not already unique)
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId") WHERE "stripeCustomerId" IS NOT NULL;

