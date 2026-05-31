"use client"

import { useRouter } from "next/navigation"
import { LogOut, Menu, ChevronDown, Settings, User, Home } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Select defaultValue="current">
          <SelectTrigger className="h-8 w-[140px] border-none bg-transparent text-sm shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Ce mois</SelectItem>
            <SelectItem value="last">Mois dernier</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 rounded-full px-2 hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-semibold text-white">
                MC
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-semibold text-white">
                MC
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Marie Conciergerie</span>
              <span className="text-xs text-muted-foreground">demo@conciergeflow.fr</span>
            </div>
          </div>
          <DropdownMenuSeparator className="my-0" />
          <div className="p-1">
            <DropdownMenuItem
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-accent cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-accent cursor-pointer"
              onClick={() => router.push("/properties")}
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Mes logements
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-accent cursor-pointer"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Paramètres
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="my-0" />
          <div className="p-1">
            <DropdownMenuItem
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
