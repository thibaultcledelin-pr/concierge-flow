"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { propertySchema } from "@/lib/validators"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PropertyFormData = z.infer<typeof propertySchema>

const propertyTypes = [
  { value: "APARTMENT", label: "Appartement" },
  { value: "HOUSE", label: "Maison" },
  { value: "STUDIO", label: "Studio" },
  { value: "LOFT", label: "Loft" },
  { value: "VILLA", label: "Villa" },
  { value: "OTHER", label: "Autre" },
]

interface PropertyFormProps {
  defaultValues?: Partial<PropertyFormData>
  propertyId?: string
}

export function PropertyForm({ defaultValues, propertyId }: PropertyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditing = !!propertyId

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      name: "",
      address: "",
      city: "",
      type: "APARTMENT",
      rooms: 1,
      ...defaultValues,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = watch("type")

  async function onSubmit(data: PropertyFormData) {
    setError(null)
    setLoading(true)

    const url = isEditing
      ? `/api/properties/${propertyId}`
      : "/api/properties"
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
      title: isEditing ? "Logement modifié" : "Logement créé",
      description: data.name,
    })
    router.push("/properties")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Modifier le logement" : "Nouveau logement"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nom du logement</Label>
            <Input id="name" placeholder="Studio Marais" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" placeholder="12 rue de Rivoli" {...register("address")} />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" placeholder="Paris" {...register("city")} />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={selectedType}
                onValueChange={(val) =>
                  setValue("type", val as PropertyFormData["type"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Pièces</Label>
              <Input
                id="rooms"
                type="number"
                min={1}
                {...register("rooms", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surface">Surface (m²)</Label>
              <Input
                id="surface"
                type="number"
                step="0.1"
                placeholder="45"
                {...register("surface", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Loyer mensuel (€)</Label>
              <Input
                id="monthlyRent"
                type="number"
                step="0.01"
                placeholder="1200"
                {...register("monthlyRent", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission conciergerie (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.1"
                placeholder="20"
                {...register("commissionRate", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">Sert à calculer le net à reverser au propriétaire</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="icalUrl">URL iCal Airbnb</Label>
              <Input
                id="icalUrl"
                type="url"
                placeholder="https://www.airbnb.com/calendar/ical/..."
                {...register("icalUrl")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icalUrlBooking">URL iCal Booking</Label>
              <Input
                id="icalUrlBooking"
                type="url"
                placeholder="https://admin.booking.com/..."
                {...register("icalUrlBooking")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium">Propriétaire (optionnel)</p>
              <p className="text-xs text-muted-foreground">
                Pour envoyer les rapports mensuels par email directement au propriétaire du logement.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Nom du propriétaire</Label>
              <Input
                id="ownerName"
                placeholder="Jean Dupont"
                {...register("ownerName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Email du propriétaire</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="jean.dupont@example.com"
                {...register("ownerEmail")}
              />
              {errors.ownerEmail && (
                <p className="text-sm text-destructive">{errors.ownerEmail.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditing ? "Enregistrement..." : "Création..."
              : isEditing ? "Enregistrer" : "Créer le logement"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/properties")}
          >
            Annuler
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
