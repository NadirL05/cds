import Link from "next/link";
import {
  Menu,
  Shield,
  CalendarDays,
  LucideIcon,
  LayoutDashboard,
  Calendar,
  User,
  CreditCard,
  Dumbbell,
  Utensils,
  History,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { AiChatWidget } from "@/components/member/ai-chat-widget";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";

type NavigationItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get authenticated user
  const userId = await getUserIdOrRedirect();

  // Check subscription status and role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, role: true },
  });

  // If user doesn't have an active subscription, redirect to subscribe page
  // Exception: allow access to /member/profile so users can see their profile
  // (We'll check the path in the client-side or make profile accessible)
  if (user?.subscriptionStatus !== "active") {
    redirect("/subscribe");
  }

  // Create dynamic navigation array
  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/member", icon: LayoutDashboard },
    { name: "Mes Réservations", href: "/member/bookings", icon: Calendar },
    { name: "Mon Abonnement", href: "/member/subscription", icon: CreditCard },
    { name: "Programme Sportif", href: "/member/program", icon: Dumbbell },
    { name: "Programme Nutrition", href: "/member/nutrition", icon: Utensils },
    { name: "Historique", href: "/member/history", icon: History },
    { name: "Mon Profil", href: "/member/profile", icon: User },
  ];

  // Add Coach link if user is COACH, FRANCHISE_OWNER or SUPER_ADMIN
  if (user?.role === "COACH" || user?.role === "FRANCHISE_OWNER" || user?.role === "SUPER_ADMIN") {
    navigation.push({
      name: "Espace Coach",
      href: "/coach",
      icon: CalendarDays,
    });
  }

  // Add Admin link if user is FRANCHISE_OWNER or SUPER_ADMIN
  if (user?.role === "FRANCHISE_OWNER" || user?.role === "SUPER_ADMIN") {
    navigation.push({
      name: "Espace Admin",
      href: "/admin",
      icon: Shield,
    });
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
                    href="/member"
                    className="mb-4 text-xl font-bold text-primary"
                  >
                    CDS Sport
                  </Link>
                  <SidebarNav navigation={navigation} />
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
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r bg-sidebar md:block">
          <div className="flex h-full flex-col p-6">
            <SidebarNav navigation={navigation} />
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container p-6">{children}</div>
        </main>

        {/* Floating AI coach chat widget - only for members */}
        {user?.role === "MEMBER" && <AiChatWidget />}
      </div>
    </div>
  );
}
