import Link from "next/link";
import { Menu, User } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/member" },
  { name: "My Bookings", href: "/member/bookings" },
  { name: "Profile", href: "/member/profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

          {/* Desktop Navigation + User Avatar */}
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
            <Avatar className="h-8 w-8 border-2 border-slate-300">
              <AvatarFallback className="bg-slate-100 text-slate-700">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
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
