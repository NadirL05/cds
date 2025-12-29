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

const adminNavigation = [
  { name: "Members", href: "/admin/members" },
  // Add more admin links here as needed
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get authenticated user
  const userId = await getUserIdOrRedirect();

  // Fetch user with role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Security check: Only FRANCHISE_OWNER and SUPER_ADMIN can access admin area
  if (!user || (user.role !== "FRANCHISE_OWNER" && user.role !== "SUPER_ADMIN")) {
    redirect("/member");
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
                    href="/admin"
                    className="mb-4 text-xl font-bold text-primary"
                  >
                    CDS Admin
                  </Link>
                  <nav className="flex flex-col space-y-2">
                    {adminNavigation.map((item) => (
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
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">CDS Admin</span>
          </Link>

          {/* Desktop Navigation + User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <nav className="flex items-center space-x-6">
              {adminNavigation.map((item) => (
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
              {adminNavigation.map((item) => (
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

