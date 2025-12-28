import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/member" },
  { name: "My Bookings", href: "/member/bookings" },
  { name: "Profile", href: "/member/profile" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get authenticated user
  const userId = await getUserIdOrRedirect();

  // Check subscription status
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });

  // If user doesn't have an active subscription, redirect to subscribe page
  // Exception: allow access to /member/profile so users can see their profile
  // (We'll check the path in the client-side or make profile accessible)
  if (user?.subscriptionStatus !== "active") {
    redirect("/subscribe");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <Drawer direction="left">
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="w-[300px] max-w-[85vw]">
                <div className="flex flex-col p-4">
                  <Link
                    href="/member"
                    className="mb-4 text-xl font-bold text-primary"
                  >
                    CDS Sport
                  </Link>
                  <nav className="flex flex-col space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Logo */}
          <Link href="/member" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">CDS Sport</span>
          </Link>

          {/* Desktop Navigation + User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <nav className="flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r bg-card md:block">
          <div className="flex h-full flex-col p-6">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
