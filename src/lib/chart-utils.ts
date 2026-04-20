export const MONTHS_FR = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"]

export function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  return `${MONTHS_FR[parseInt(m) - 1]} ${year.slice(2)}`
}

export const TOOLTIP_STYLE = {
  backgroundColor: "rgba(18,14,10,0.96)",
  border: "1px solid rgba(255,200,100,0.08)",
  borderRadius: "12px",
  padding: "14px 16px",
  color: "#d4d4d4",
  fontSize: "13px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
} as const

export const GRID_STYLE = {
  stroke: "rgba(255,255,255,0.04)",
  strokeDasharray: "4 4",
} as const

export const AXIS_STYLE = {
  stroke: "rgba(255,255,255,0.3)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const
