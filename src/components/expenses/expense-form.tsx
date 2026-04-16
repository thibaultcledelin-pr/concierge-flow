"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { expenseSchema } from "@/lib/validators"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ExpenseFormData = z.infer<typeof expenseSchema>

interface Property {
  id: string
  name: string
}

const categoryLabels: Record<string, string> = {
  CLEANING: "Ménage",
  MAINTENANCE: "Maintenance",
  SUPPLIES: "Fournitures",
  RENT: "Loyer",
  INSURANCE: "Assurance",
  TAX: "Taxes",
  PLATFORM_FEE: "Commission plateforme",
  UTILITIES: "Charges",
  FURNISHING: "Ameublement",
  MARKETING: "Marketing",
  OTHER: "Autre",
}

const frequencyLabels: Record<string, string> = {
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuel",
  QUARTERLY: "Trimestriel",
  YEARLY: "Annuel",
}

interface ExpenseFormProps {
  properties: Property[]
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<ExpenseFormData> & { id?: string }
  onSuccess: () => void
}

export function ExpenseForm({
  properties,
  open,
  onOpenChange,
  defaultValues,
  onSuccess,
}: ExpenseFormProps) {
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditing = !!defaultValues?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      category: "OTHER",
      label: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      ...defaultValues,
    },
  })

  const isRecurring = watch("isRecurring")
  const selectedCategory = watch("category")
  const selectedProperty = watch("propertyId")
  const selectedFrequency = watch("frequency")

  async function onSubmit(data: ExpenseFormData) {
    setError(null)
    setLoading(true)

    const url = isEditing && defaultValues?.id
      ? `/api/expenses/${defaultValues.id}`
      : "/api/expenses"
    const method = isEditing ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(err.error || "Une erreur est survenue")
      setLoading(false)
      return
    }

    toast({
      title: isEditing ? "Dépense modifiée" : "Dépense ajoutée",
      description: data.label,
    })
    reset()
    onOpenChange(false)
    onSuccess()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la dépense" : "Nouvelle dépense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="label">Libellé</Label>
            <Input id="label" placeholder="Ménage mensuel" {...register("label")} />
            {errors.label && (
              <p className="text-xs text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="50"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) =>
                  setValue("category", val as ExpenseFormData["category"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Logement</Label>
              <Select
                value={selectedProperty || "global"}
                onValueChange={(val) =>
                  setValue("propertyId", val === "global" ? undefined : val)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Globale (tous)</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isRecurring"
              {...register("isRecurring")}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isRecurring" className="cursor-pointer">
              Dépense récurrente
            </Label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label>Fréquence</Label>
              <Select
                value={selectedFrequency || "MONTHLY"}
                onValueChange={(val) =>
                  setValue("frequency", val as ExpenseFormData["frequency"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" placeholder="Optionnel" {...register("notes")} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing ? "Enregistrement..." : "Ajout..."
                : isEditing ? "Enregistrer" : "Ajouter"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { categoryLabels }
