import { round1 } from "@/lib/utils"

/**
 * Relevé de gestion propriétaire.
 *
 * Le cœur du métier d'une conciergerie : à partir des revenus encaissés, on
 * déduit la commission de la conciergerie (un % des revenus) et les dépenses,
 * pour obtenir le **net à reverser au propriétaire**.
 *
 *   net propriétaire = revenus − commission − dépenses
 *   revenu conciergerie = commission
 */
export interface OwnerStatement {
  grossRevenue: number
  commissionRate: number // % appliqué (0 si non configuré)
  commission: number // ce que garde la conciergerie
  expenses: number
  ownerNet: number // ce qui revient au propriétaire
}

export function computeOwnerStatement(
  totalRevenue: number,
  totalExpenses: number,
  commissionRate?: number | null,
): OwnerStatement {
  // Garde-fou : taux borné à [0, 100], 0 si non configuré
  const rate = commissionRate != null && commissionRate > 0 ? Math.min(100, commissionRate) : 0
  const commission = round1(totalRevenue * (rate / 100))
  const expenses = round1(totalExpenses)
  const ownerNet = round1(totalRevenue - commission - totalExpenses)

  return {
    grossRevenue: round1(totalRevenue),
    commissionRate: rate,
    commission,
    expenses,
    ownerNet,
  }
}
