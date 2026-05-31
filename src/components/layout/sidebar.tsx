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
  CalendarDays,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Logements", icon: Home },
  { href: "/calendar", label: "Calendrier", icon: CalendarDays },
  { href: "/revenue", label: "Revenus", icon: DollarSign },
  { href: "/expenses", label: "D\u00e9penses", icon: Receipt },
  { href: "/reports", label: "Rapports", icon: FileText },
  { href: "/alerts", label: "Alertes", icon: Bell },
  { href: "/settings", label: "Parametres", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border/50 bg-sidebar lg:block">
      <Link href="/dashboard" className="flex h-16 items-center gap-2.5 border-b border-border/50 px-5 transition-opacity hover:opacity-80">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white shadow-lg shadow-amber-500/20">
          C
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground/90">ConciergeFlow</span>
      </Link>
      <nav className="flex flex-col gap-0.5 px-3 pt-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/5"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-amber-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export { navItems }
