"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { propertySchema } from "@/lib/validators"
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
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      type: "APARTMENT",
      rooms: 1,
      ...defaultValues,
    },
  })

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
              <Label htmlFor="rooms">Pi\u00e8ces</Label>
              <Input
                id="rooms"
                type="number"
                min={1}
                {...register("rooms", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surface">Surface (m\u00b2)</Label>
              <Input
                id="surface"
                type="number"
                step="0.1"
                placeholder="45"
                {...register("surface", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Loyer mensuel (\u20ac)</Label>
            <Input
              id="monthlyRent"
              type="number"
              step="0.01"
              placeholder="1200"
              {...register("monthlyRent", { valueAsNumber: true })}
            />
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
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditing ? "Enregistrement..." : "Cr\u00e9ation..."
              : isEditing ? "Enregistrer" : "Cr\u00e9er le logement"}
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
