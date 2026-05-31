"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Search, Home, CornerDownLeft } from "lucide-react"
import { navItems } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

interface PropertyLite {
  id: string
  name: string
  city?: string | null
}

type CommandItem = {
  key: string
  label: string
  sublabel?: string
  href: string
  group: "Navigation" | "Logements"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
}

// Recherche globale (⌘K / Ctrl+K) — saute vers une page ou un logement
export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const [properties, setProperties] = useState<PropertyLite[]>([])
  const [loaded, setLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Ouvre la palette en réinitialisant la recherche (depuis le bouton ou le raccourci)
  const openPalette = useCallback(() => {
    setQuery("")
    setSelected(0)
    setOpen(true)
  }, [])

  // Raccourci clavier global : ⌘K (Mac) / Ctrl+K (Windows/Linux)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (open) setOpen(false)
        else openPalette()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, openPalette])

  // Chargement des logements à la première ouverture (lazy)
  useEffect(() => {
    if (!open || loaded) return
    let cancelled = false
    fetch("/api/properties")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PropertyLite[]) => {
        if (!cancelled) {
          setProperties(Array.isArray(data) ? data : [])
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [open, loaded])

  const items = useMemo<CommandItem[]>(() => {
    const nav: CommandItem[] = navItems.map((item) => ({
      key: `nav-${item.href}`,
      label: item.label,
      href: item.href,
      group: "Navigation",
      icon: item.icon,
    }))
    const props: CommandItem[] = properties.map((p) => ({
      key: `prop-${p.id}`,
      label: p.name,
      sublabel: p.city ?? undefined,
      href: `/properties/${p.id}`,
      group: "Logements",
      icon: Home,
    }))
    return [...nav, ...props]
  }, [properties])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.sublabel ? item.sublabel.toLowerCase().includes(q) : false)
    )
  }, [items, query])

  const go = useCallback(
    (item: CommandItem) => {
      setOpen(false)
      router.push(item.href)
    },
    [router]
  )

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelected((s) => (filtered.length ? (s + 1) % filtered.length : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelected((s) => (filtered.length ? (s - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = filtered[selected]
      if (item) go(item)
    }
  }

  // Fait défiler l'élément sélectionné dans la vue
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [selected])

  // Indices de regroupement (pour afficher les en-têtes de section)
  let lastGroup: string | null = null

  return (
    <>
      {/* Déclencheur dans la topbar */}
      <button
        type="button"
        onClick={openPalette}
        className="flex items-center gap-2 rounded-lg border border-border/60 bg-white/[0.02] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        aria-label="Recherche globale"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Rechercher…</span>
        <kbd className="ml-2 hidden items-center gap-0.5 rounded border border-border/60 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[18%] z-50 w-full max-w-xl translate-x-[-50%] overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
            }}
          >
            <DialogPrimitive.Title className="sr-only">Recherche globale</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Recherchez une page ou un logement, naviguez avec les flèches et validez avec Entrée.
            </DialogPrimitive.Description>

            <div className="flex items-center gap-3 border-b border-border/50 px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelected(0)
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Rechercher une page, un logement…"
                className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                aria-label="Rechercher"
              />
            </div>

            <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucun résultat</p>
              ) : (
                filtered.map((item, index) => {
                  const showHeader = item.group !== lastGroup
                  lastGroup = item.group
                  const isActive = index === selected
                  return (
                    <div key={item.key}>
                      {showHeader && (
                        <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.group}
                        </p>
                      )}
                      <button
                        type="button"
                        data-index={index}
                        onClick={() => go(item)}
                        onMouseMove={() => setSelected(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                          isActive ? "bg-amber-500/10 text-amber-400" : "text-foreground hover:bg-white/[0.03]"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-amber-400" : "text-muted-foreground")} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.sublabel && <span className="truncate text-xs text-muted-foreground">{item.sublabel}</span>}
                        {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-amber-400/70" />}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
