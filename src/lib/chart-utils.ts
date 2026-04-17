// Mois abrégés en français pour les axes des graphiques
export const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

// Transforme "2026-04" en "Avr 26"
export function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  return `${MONTHS_FR[parseInt(m) - 1]} ${year.slice(2)}`
}

// Style partagé pour les tooltips Recharts (dark mode)
export const TOOLTIP_STYLE = {
  backgroundColor: "rgba(15,15,15,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  padding: "12px",
  color: "#e5e5e5",
  fontSize: "13px",
} as const
