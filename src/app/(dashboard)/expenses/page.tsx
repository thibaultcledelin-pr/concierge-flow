"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Receipt, Trash2, Pencil, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExpenseForm, categoryLabels } from "@/components/expenses/expense-form"
import { RunRecurringButton } from "@/components/expenses/run-recurring-button"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Property {
  id: string
  name: string
}

interface Expense {
  id: string
  category: string
  label: string
  amount: number
  date: string
  isRecurring: boolean
  frequency: string | null
  notes: string | null
  propertyId: string | null
  property: { name: string } | null
}

export default function ExpensesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProperty, setFilterProperty] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { toast } = useToast()

  const fetchExpenses = useCallback(() => {
    const params = new URLSearchParams()
    if (filterProperty !== "all") params.set("propertyId", filterProperty)
    if (filterCategory !== "all") params.set("category", filterCategory)

    fetch(`/api/expenses?${params}`)
      .then((res) => res.json())
      .then((data) => setExpenses(data.expenses || data))
  }, [filterProperty, filterCategory])

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!loading) fetchExpenses()
  }, [loading, fetchExpenses])

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette dépense ?")) return
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast({ title: "Erreur", description: "Impossible de supprimer cette dépense", variant: "destructive" })
        return
      }
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    } catch {
      toast({ title: "Erreur réseau", description: "Vérifiez votre connexion", variant: "destructive" })
    }
  }

  function handleEdit(expense: Expense) {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const recurringCount = expenses.filter((expense) => expense.isRecurring).length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dépenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {expenses.length} dépense{expenses.length !== 1 ? "s" : ""} · {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RunRecurringButton onDone={() => fetchExpenses()} />
          <Button
            onClick={() => {
              setEditingExpense(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={filterProperty} onValueChange={setFilterProperty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Logement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les logements</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Receipt className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucune dépense enregistrée
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingExpense(null)
                setFormOpen(true)
              }}
            >
              Ajouter une dépense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Dépenses
              {recurringCount > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  dont {recurringCount} récurrente{recurringCount > 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
            <span className="text-sm font-semibold text-destructive">
              -{formatCurrency(totalExpenses)}
            </span>
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
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {expense.label}
                        {expense.isRecurring && (
                          <RefreshCw className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[expense.category] || expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {expense.property?.name || "Globale"}
                    </TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleEdit(expense)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDelete(expense.id)}
                        >
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
      )}

      <ExpenseForm
        properties={properties}
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultValues={
          editingExpense
            ? {
                id: editingExpense.id,
                category: editingExpense.category as "CLEANING",
                label: editingExpense.label,
                amount: editingExpense.amount,
                date: editingExpense.date.split("T")[0],
                isRecurring: editingExpense.isRecurring,
                frequency: editingExpense.frequency as "MONTHLY" | undefined,
                propertyId: editingExpense.propertyId || undefined,
                notes: editingExpense.notes || undefined,
              }
            : undefined
        }
        onSuccess={fetchExpenses}
      />
    </div>
  )
}
