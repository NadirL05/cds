/**
 * TEST USER ID - For development/testing purposes
 * This should be replaced with actual authentication in production
 * 
 * Use the email from seed: "member1@cds.fr" (Alice Smith)
 * You can get the actual ID by running a query or checking the database
 */
export const TEST_USER_EMAIL = "member1@example.com";

// This will be fetched dynamically - placeholder for now
// In a real app, this comes from the authenticated session
export async function getTestUserId(): Promise<string> {
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
    select: { id: true },
  });
  
  if (!user) {
    throw new Error(`Test user with email ${TEST_USER_EMAIL} not found. Run the seed script first.`);
  }
  
  return user.id;
}
