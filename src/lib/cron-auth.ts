import { NextResponse } from "next/server"
import { createHash, timingSafeEqual } from "crypto"

/**
 * Authentifie une requête de cron.
 *
 * - **Fail-closed** : si `CRON_SECRET` n'est pas configuré, la route est refusée
 *   (évite qu'un endpoint cron soit ouvert à tous quand la variable manque).
 * - **Timing-safe** : la comparaison passe par un hash SHA-256 de longueur fixe,
 *   ce qui évite à la fois une attaque temporelle et une fuite de longueur.
 * - **Bearer** : standard `Authorization: Bearer <secret>` — c'est l'en-tête que
 *   Vercel Cron envoie automatiquement.
 *
 * Retourne `null` si la requête est autorisée, sinon une `NextResponse` d'erreur
 * à renvoyer directement.
 */
export function requireCron(request: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET non configuré — endpoint désactivé" },
      { status: 503 }
    )
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? ""

  // Hash de longueur fixe → timingSafeEqual ne lève pas et ne fuite pas la longueur
  const a = createHash("sha256").update(provided).digest()
  const b = createHash("sha256").update(expected).digest()

  if (!timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}
