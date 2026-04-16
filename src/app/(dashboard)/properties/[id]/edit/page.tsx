"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PropertyForm } from "@/components/properties/property-form"

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/properties/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setDefaultValues({
          name: data.name,
          address: data.address,
          city: data.city,
          type: data.type,
          rooms: data.rooms,
          surface: data.surface ?? undefined,
          icalUrl: data.icalUrl ?? "",
          icalUrlBooking: data.icalUrlBooking ?? "",
          monthlyRent: data.monthlyRent ?? undefined,
        })
        setLoading(false)
      })
      .catch(() => router.push("/properties"))
  }, [params.id, router])

  if (loading || !defaultValues) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PropertyForm
        defaultValues={defaultValues}
        propertyId={params.id as string}
      />
    </div>
  )
}
