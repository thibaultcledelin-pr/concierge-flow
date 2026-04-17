"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Home,
  DollarSign,
  Receipt,
  Bell,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Logements", icon: Home },
  { href: "/revenue", label: "Revenus", icon: DollarSign },
  { href: "/expenses", label: "D\u00e9penses", icon: Receipt },
  { href: "/reports", label: "Rapports", icon: FileText },
  { href: "/alerts", label: "Alertes", icon: Bell },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
          C
        </div>
        <span className="text-sm font-bold tracking-tight">ConciergeFlow</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-600/15 text-violet-400"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export { navItems }
