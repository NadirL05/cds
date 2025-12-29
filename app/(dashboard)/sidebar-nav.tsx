"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type NavigationItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
};

interface SidebarNavProps {
  navigation: NavigationItem[];
}

export function SidebarNav({ navigation }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

