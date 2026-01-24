import Link from "next/link";
import {
  Menu,
  LayoutDashboard,
  Users,
  Calendar,
  UserCog,
  BarChart3,
  Settings,
  Wrench,
  Home,
  LucideIcon,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminSidebarNav } from "./admin-sidebar-nav";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const adminNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Membres", href: "/admin/members", icon: Users },
  { name: "Réservations", href: "/admin/bookings", icon: Calendar },
  { name: "Coachs", href: "/admin/coaches", icon: UserCog },
  { name: "Statistiques", href: "/admin/stats", icon: BarChart3 },
  { name: "Paramètres", href: "/admin/settings", icon: Settings },
  { name: "Outils & Tests", href: "/admin/tools", icon: Wrench },
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
              <DrawerContent className="w-[300px] max-w-[85vw] bg-sidebar text-sidebar-foreground">
                <div className="flex flex-col p-4">
                  <Link
                    href="/admin"
                    className="mb-4 text-xl font-bold text-primary"
                  >
                    CDS Admin
                  </Link>
                  <AdminSidebarNav navigation={adminNavigation} />
                  <div className="mt-6 border-t pt-4">
                    <Link
                      href="/member"
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Home className="h-4 w-4" />
                      Espace Membre
                    </Link>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Logo */}
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">CDS Admin</span>
          </Link>

          {/* Desktop Header Navigation + User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/member"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Home className="h-4 w-4" />
              Espace Membre
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r bg-sidebar md:block">
          <div className="flex h-full flex-col p-6">
            <AdminSidebarNav navigation={adminNavigation} />
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

