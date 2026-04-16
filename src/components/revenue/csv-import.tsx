"use client"

import { useState, useRef } from "react"
import { Upload, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CsvImportProps {
  propertyId: string
}

interface ImportResult {
  created: number
  matched: number
  total: number
  error?: string
}

export function CsvImport({ propertyId }: CsvImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [platform, setPlatform] = useState<string>("auto")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleImport() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("propertyId", propertyId)
    if (platform !== "auto") {
      formData.append("platform", platform)
    }

    const res = await fetch("/api/revenue/import-csv", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      setResult({ created: 0, matched: 0, total: 0, error: data.error })
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Fichier CSV</label>
          <div
            className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {fileName || "Choisir un fichier..."}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Plateforme</label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="AIRBNB">Airbnb</SelectItem>
              <SelectItem value="BOOKING">Booking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleImport} disabled={loading || !fileName} size="sm">
          {loading ? "Import..." : "Importer"}
        </Button>
      </div>

      {result && (
        <div className="space-y-1">
          {result.error ? (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {result.error}
            </p>
          ) : (
            <>
              {result.created > 0 && (
                <p className="flex items-center gap-2 text-sm text-green-400">
                  <Check className="h-4 w-4" />
                  {result.created} r\u00e9servation{result.created > 1 ? "s" : ""} cr\u00e9\u00e9e{result.created > 1 ? "s" : ""}
                </p>
              )}
              {result.matched > 0 && (
                <p className="text-sm text-muted-foreground">
                  {result.matched} existante{result.matched > 1 ? "s" : ""} enrichie{result.matched > 1 ? "s" : ""} (montants ajout\u00e9s)
                </p>
              )}
              {result.created === 0 && result.matched === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucune nouvelle r\u00e9servation dans ce fichier.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
