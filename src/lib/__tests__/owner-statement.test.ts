import { describe, it, expect } from "vitest"
import { computeOwnerStatement } from "../owner-statement"

describe("computeOwnerStatement", () => {
  it("calcule commission et net propriétaire avec un taux de 20%", () => {
    const s = computeOwnerStatement(5000, 800, 20)
    expect(s.commission).toBe(1000) // 20% de 5000
    expect(s.ownerNet).toBe(3200) // 5000 − 1000 − 800
    expect(s.commissionRate).toBe(20)
  })

  it("net propriétaire = revenus − dépenses quand il n'y a pas de commission", () => {
    const s = computeOwnerStatement(5000, 800, null)
    expect(s.commission).toBe(0)
    expect(s.ownerNet).toBe(4200)
    expect(s.commissionRate).toBe(0)
  })

  it("plafonne le taux à 100%", () => {
    const s = computeOwnerStatement(1000, 0, 150)
    expect(s.commissionRate).toBe(100)
    expect(s.commission).toBe(1000)
    expect(s.ownerNet).toBe(0)
  })

  it("gère un net propriétaire négatif (dépenses > revenus net de commission)", () => {
    const s = computeOwnerStatement(1000, 1200, 20)
    expect(s.commission).toBe(200)
    expect(s.ownerNet).toBe(-400) // 1000 − 200 − 1200
  })

  it("arrondit à une décimale", () => {
    const s = computeOwnerStatement(333.33, 0, 15)
    expect(s.commission).toBe(50)
    expect(s.grossRevenue).toBe(333.3)
  })
})
