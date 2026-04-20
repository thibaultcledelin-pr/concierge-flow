"use client"

import { useEffect, useState } from "react"
import { User, Building2, Shield, Trash2, Download, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageLoading } from "@/components/ui/page-loading"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  email: string
  name: string | null
  company: string | null
  createdAt: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data)
        setName(data.name || "")
        setCompany(data.company || "")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Profil mis a jour" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      toast({ title: "Mot de passe trop court", description: "Minimum 6 caracteres", variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Les mots de passe ne correspondent pas", variant: "destructive" })
      return
    }

    setPasswordSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword("")
      setConfirmPassword("")
      toast({ title: "Mot de passe modifie" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le mot de passe", variant: "destructive" })
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleExportData() {
    toast({ title: "Export en cours..." })
    try {
      const [propertiesRes, expensesRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/expenses"),
      ])
      const properties = await propertiesRes.json()
      const expensesData = await expensesRes.json()

      const data = {
        exportedAt: new Date().toISOString(),
        properties,
        expenses: expensesData.expenses || expensesData,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `conciergeflow-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({ title: "Donnees exportees" })
    } catch {
      toast({ title: "Erreur", description: "Impossible d'exporter", variant: "destructive" })
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Supprimer votre compte et toutes vos donnees ? Cette action est irreversible.")) return
    if (!confirm("Etes-vous vraiment sur ? Toutes vos donnees seront perdues.")) return

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = "/login"
    } catch {
      toast({ title: "Erreur", description: "Contactez le support", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parametres</h1>
        <div className="mt-4"><PageLoading /></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parametres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerez votre profil et les parametres de votre compte
        </p>
      </div>

      {/* Profil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <User className="h-5 w-5 text-amber-400" />
            </div>
            <CardTitle className="text-base">Profil</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email || ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">L&apos;email ne peut pas etre modifie</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              placeholder="Jean Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-amber-500 hover:bg-amber-400">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Conciergerie */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>
            <CardTitle className="text-base">Conciergerie</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Nom de la conciergerie</Label>
            <Input
              id="company"
              placeholder="Conciergerie Marais"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-amber-500 hover:bg-amber-400">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <CardTitle className="text-base">Securite</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Minimum 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Retapez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={passwordSaving || !newPassword} variant="outline">
            {passwordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Modifier le mot de passe
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zone de danger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
            <div>
              <p className="text-sm font-medium">Exporter mes donnees</p>
              <p className="text-xs text-muted-foreground">Telechargez toutes vos donnees au format JSON</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/[0.03] p-4">
            <div>
              <p className="text-sm font-medium text-destructive">Supprimer mon compte</p>
              <p className="text-xs text-muted-foreground">Toutes vos donnees seront supprimees definitivement</p>
            </div>
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleDeleteAccount}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>

          {profile && (
            <p className="text-xs text-muted-foreground">
              Compte cree le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
