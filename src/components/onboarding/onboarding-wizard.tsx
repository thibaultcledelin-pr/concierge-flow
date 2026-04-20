"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Receipt, CheckCircle, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { categoryLabels } from "@/lib/constants"

const STEPS = [
  { icon: Home, label: "Bienvenue" },
  { icon: Home, label: "Logement" },
  { icon: Receipt, label: "Depenses" },
  { icon: CheckCircle, label: "Pret !" },
]

const typeOptions = [
  { value: "APARTMENT", label: "Appartement" },
  { value: "HOUSE", label: "Maison" },
  { value: "STUDIO", label: "Studio" },
  { value: "LOFT", label: "Loft" },
  { value: "VILLA", label: "Villa" },
  { value: "OTHER", label: "Autre" },
]

interface ExpenseEntry {
  label: string
  amount: string
  category: string
  isRecurring: boolean
}

export function OnboardingWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [propertyId, setPropertyId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    type: "APARTMENT",
    rooms: 1,
    icalUrl: "",
  })

  const [expenses, setExpenses] = useState<ExpenseEntry[]>([
    { label: "", amount: "", category: "CLEANING", isRecurring: false },
  ])

  async function handleCreateProperty() {
    if (!form.name || !form.address || !form.city) {
      toast({ title: "Champs requis", description: "Remplissez le nom, l'adresse et la ville", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rooms: Number(form.rooms),
          icalUrl: form.icalUrl || undefined,
        }),
      })

      if (!res.ok) throw new Error()
      const property = await res.json()
      setPropertyId(property.id)
      setStep(2)
    } catch {
      toast({ title: "Erreur", description: "Impossible de creer le logement", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveExpenses() {
    const validExpenses = expenses.filter((e) => e.label && e.amount)
    if (validExpenses.length === 0) {
      setStep(3)
      return
    }

    setSaving(true)
    try {
      for (const expense of validExpenses) {
        await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            label: expense.label,
            amount: parseFloat(expense.amount),
            category: expense.category,
            date: new Date().toISOString(),
            isRecurring: expense.isRecurring,
            frequency: expense.isRecurring ? "MONTHLY" : undefined,
          }),
        })
      }
      setStep(3)
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder les depenses", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  function addExpense() {
    setExpenses([...expenses, { label: "", amount: "", category: "OTHER", isRecurring: false }])
  }

  function removeExpense(index: number) {
    setExpenses(expenses.filter((_, i) => i !== index))
  }

  function updateExpense(index: number, field: keyof ExpenseEntry, value: string | boolean) {
    const updated = [...expenses]
    updated[index] = { ...updated[index], [field]: value }
    setExpenses(updated)
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Steps indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i <= step ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 transition-colors ${i < step ? "bg-amber-500" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <Card>
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15">
                <Home className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bienvenue sur ConciergeFlow</h2>
                <p className="mt-2 text-muted-foreground">
                  Suivez vos logements, vos revenus et vos depenses en un seul endroit.
                  Commençons par ajouter votre premier logement.
                </p>
              </div>
              <Button onClick={() => setStep(1)} className="w-full bg-amber-500 hover:bg-amber-400">
                Commencer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Add first property */}
        {step === 1 && (
          <Card>
            <CardContent className="space-y-5 p-8">
              <div className="text-center">
                <h2 className="text-xl font-bold">Ajoutez votre premier logement</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vous pourrez le modifier et en ajouter d&apos;autres plus tard.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du logement *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Studio Marais"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      placeholder="12 rue de Rivoli"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      placeholder="Paris"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rooms">Pieces</Label>
                    <Input
                      id="rooms"
                      type="number"
                      min={1}
                      value={form.rooms}
                      onChange={(e) => setForm({ ...form, rooms: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ical">URL iCal Airbnb (optionnel)</Label>
                  <Input
                    id="ical"
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    value={form.icalUrl}
                    onChange={(e) => setForm({ ...form, icalUrl: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Airbnb &rarr; Votre annonce &rarr; Tarifs et disponibilites &rarr; Exporter le calendrier
                  </p>
                </div>
              </div>

              <Button onClick={handleCreateProperty} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-400">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Creer mon logement
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Add expenses for the property */}
        {step === 2 && (
          <Card>
            <CardContent className="space-y-5 p-8">
              <div className="text-center">
                <h2 className="text-xl font-bold">Ajoutez vos depenses</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Menage, assurance, charges... Ajoutez les depenses liees a <strong>{form.name}</strong>.
                </p>
              </div>

              <div className="space-y-3">
                {expenses.map((expense, i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-border/40 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Depense {i + 1}</span>
                      {expenses.length > 1 && (
                        <button onClick={() => removeExpense(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Ex: Menage"
                        value={expense.label}
                        onChange={(e) => updateExpense(i, "label", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Montant en euros"
                        value={expense.amount}
                        onChange={(e) => updateExpense(i, "amount", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={expense.category} onValueChange={(v) => updateExpense(i, "category", v)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={expense.isRecurring}
                          onChange={(e) => updateExpense(i, "isRecurring", e.target.checked)}
                          className="rounded border-border"
                        />
                        Recurrente
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addExpense}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 py-2.5 text-sm text-muted-foreground transition-colors hover:border-amber-500/30 hover:text-amber-400"
              >
                <Plus className="h-4 w-4" />
                Ajouter une depense
              </button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Passer cette etape
                </Button>
                <Button onClick={handleSaveExpenses} disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-400">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <Card>
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Vous etes pret !</h2>
                <p className="mt-2 text-muted-foreground">
                  Votre premier logement est cree{expenses.some((e) => e.label) ? " avec ses depenses" : ""}.
                  Vous pouvez maintenant suivre votre rentabilite.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/properties")} className="flex-1">
                  Voir mes logements
                </Button>
                <Button onClick={() => router.push("/dashboard")} className="flex-1 bg-amber-500 hover:bg-amber-400">
                  Aller au dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
