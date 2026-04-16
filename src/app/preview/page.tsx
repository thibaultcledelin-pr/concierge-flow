import { Home, LayoutDashboard, DollarSign, Receipt, Bell, Plus, Pencil, Trash2, RefreshCw, ChevronDown, Upload, Check, TrendingDown, Percent, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const navItems = [
  { href: "#", label: "Dashboard", icon: LayoutDashboard, active: true },
  { href: "#", label: "Logements", icon: Home, active: false },
  { href: "#", label: "Revenus", icon: DollarSign, active: false },
  { href: "#", label: "Dépenses", icon: Receipt, active: false },
  { href: "#", label: "Alertes", icon: Bell, active: false },
]

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export default function PreviewPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
            C
          </div>
          <span className="text-sm font-bold tracking-tight">ConciergeFlow</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.active
                  ? "bg-violet-600/15 text-violet-400"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Ce mois</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-violet-600 text-xs text-white">CF</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* ====== SECTION: Dashboard ====== */}
          <section>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Vue d&apos;ensemble — 3 logements</p>

            {/* KPI Cards */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg bg-muted p-2.5 text-green-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenu total</p>
                    <p className="text-xl font-bold">12 450,00 €</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg bg-muted p-2.5 text-red-400">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dépenses</p>
                    <p className="text-xl font-bold">-3 200,00 €</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg bg-muted p-2.5 text-violet-400">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marge nette</p>
                    <p className="text-xl font-bold">74,3%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg bg-muted p-2.5 text-blue-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taux d&apos;occupation</p>
                    <p className="text-xl font-bold">82,5%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profitability Table */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Rentabilité par logement</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logement</TableHead>
                      <TableHead className="text-right">Revenus</TableHead>
                      <TableHead className="text-right">Dépenses</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Marge</TableHead>
                      <TableHead className="text-center">Nuits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <span className="font-medium">Studio Marais</span>
                        <p className="text-xs text-muted-foreground">Paris</p>
                      </TableCell>
                      <TableCell className="text-right text-green-400">5 200,00 €</TableCell>
                      <TableCell className="text-right text-red-400">1 100,00 €</TableCell>
                      <TableCell className="text-right font-medium">4 100,00 €</TableCell>
                      <TableCell className="text-right text-green-400">78,8%</TableCell>
                      <TableCell className="text-center">22</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <span className="font-medium">Appart Bastille</span>
                        <p className="text-xs text-muted-foreground">Paris</p>
                      </TableCell>
                      <TableCell className="text-right text-green-400">4 800,00 €</TableCell>
                      <TableCell className="text-right text-red-400">1 200,00 €</TableCell>
                      <TableCell className="text-right font-medium">3 600,00 €</TableCell>
                      <TableCell className="text-right text-green-400">75,0%</TableCell>
                      <TableCell className="text-center">18</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <span className="font-medium">Loft Croix-Rousse</span>
                        <p className="text-xs text-muted-foreground">Lyon</p>
                      </TableCell>
                      <TableCell className="text-right text-green-400">2 450,00 €</TableCell>
                      <TableCell className="text-right text-red-400">900,00 €</TableCell>
                      <TableCell className="text-right font-medium">1 550,00 €</TableCell>
                      <TableCell className="text-right text-yellow-400">63,3%</TableCell>
                      <TableCell className="text-center">12</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* ====== SECTION: Logements ====== */}
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Logements</h2>
                <p className="mt-1 text-sm text-muted-foreground">3 logements</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Studio Marais", address: "12 rue de Rivoli", city: "Paris", type: "Studio", rooms: 1, surface: 28, rent: 1200 },
                { name: "Appart Bastille", address: "45 rue de la Roquette", city: "Paris", type: "Appartement", rooms: 3, surface: 65, rent: 1800 },
                { name: "Loft Croix-Rousse", address: "8 montée de la Grande Côte", city: "Lyon", type: "Loft", rooms: 2, surface: 55, rent: 950 },
              ].map((p) => (
                <Card key={p.name}>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">{p.address}, {p.city}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{p.type}</Badge>
                    </div>
                    <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                      <span>{p.rooms} pièce{p.rooms > 1 ? "s" : ""}</span>
                      <span>{p.surface} m²</span>
                      <span>{p.rent} €/mois</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Pencil className="mr-1 h-3 w-3" /> Modifier
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="mr-1 h-3 w-3" /> Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator />

          {/* ====== SECTION: Revenus ====== */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight">Revenus</h2>
            <p className="mt-1 text-sm text-muted-foreground">Importez vos revenus depuis Airbnb ou Booking</p>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Importer un CSV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Fichier CSV</label>
                    <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">airbnb-mai-2026.csv</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Plateforme</label>
                    <div className="flex h-9 items-center rounded-md border border-input px-3 text-sm">
                      Auto-detect
                    </div>
                  </div>
                  <Button size="sm">Importer</Button>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="flex items-center gap-2 text-sm text-green-400">
                    <Check className="h-4 w-4" /> 8 réservations importées
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2 existantes enrichies (montants ajoutés)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Réservations (5)</CardTitle>
                <span className="text-sm font-semibold text-green-400">5 200,00 €</span>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voyageur</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead className="text-center">Nuits</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { guest: "Jean Dupont", in: "1 mai 2026", out: "4 mai 2026", nights: 3, amount: "450,00 €", platform: "AIRBNB" },
                      { guest: "Marie Martin", in: "7 mai 2026", out: "10 mai 2026", nights: 3, amount: "520,00 €", platform: "AIRBNB" },
                      { guest: "Pierre Durand", in: "12 mai 2026", out: "17 mai 2026", nights: 5, amount: "1 200,00 €", platform: "BOOKING" },
                      { guest: "Sophie Leroy", in: "19 mai 2026", out: "22 mai 2026", nights: 3, amount: "480,00 €", platform: "AIRBNB" },
                      { guest: "Thomas Bernard", in: "25 mai 2026", out: "31 mai 2026", nights: 6, amount: "2 550,00 €", platform: "BOOKING" },
                    ].map((b) => (
                      <TableRow key={b.guest}>
                        <TableCell>{b.guest}</TableCell>
                        <TableCell>{b.in}</TableCell>
                        <TableCell>{b.out}</TableCell>
                        <TableCell className="text-center">{b.nights}</TableCell>
                        <TableCell className="text-right">{b.amount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{b.platform}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* ====== SECTION: Dépenses ====== */}
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Dépenses</h2>
                <p className="mt-1 text-sm text-muted-foreground">6 dépenses · 3 200,00 €</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Dépenses
                  <span className="ml-2 text-xs font-normal text-muted-foreground">dont 3 récurrentes</span>
                </CardTitle>
                <span className="text-sm font-semibold text-destructive">-3 200,00 €</span>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Libellé</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Logement</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { label: "Ménage mensuel", cat: "Ménage", property: "Studio Marais", date: "1 mai 2026", amount: "80,00 €", recurring: true },
                      { label: "Assurance habitation", cat: "Assurance", property: "Globale", date: "1 mai 2026", amount: "450,00 €", recurring: true },
                      { label: "Réparation chauffe-eau", cat: "Maintenance", property: "Appart Bastille", date: "5 mai 2026", amount: "320,00 €", recurring: false },
                      { label: "Loyer mai", cat: "Loyer", property: "Studio Marais", date: "1 mai 2026", amount: "1 200,00 €", recurring: true },
                      { label: "Produits ménagers", cat: "Fournitures", property: "Loft Croix-Rousse", date: "10 mai 2026", amount: "45,00 €", recurring: false },
                      { label: "Commission Airbnb", cat: "Commission", property: "Studio Marais", date: "15 mai 2026", amount: "1 105,00 €", recurring: false },
                    ].map((e) => (
                      <TableRow key={e.label}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {e.label}
                            {e.recurring && <RefreshCw className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{e.cat}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{e.property}</TableCell>
                        <TableCell>{e.date}</TableCell>
                        <TableCell className="text-right font-medium">{e.amount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7">
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* ====== SECTION: Login ====== */}
          <section className="mx-auto max-w-sm">
            <div className="mb-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">C</div>
                <span className="text-xl font-bold tracking-tight">ConciergeFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">Suivi de rentabilité pour conciergeries</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-lg">Connexion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="vous@exemple.fr" />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full">Se connecter</Button>
                <p className="text-center text-sm text-muted-foreground">
                  Pas encore de compte ? <span className="text-primary underline-offset-4 hover:underline">Créer un compte</span>
                </p>
              </CardFooter>
            </Card>
          </section>

        </main>
      </div>
    </div>
  )
}
