import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

interface PropertyProfit {
  propertyId: string
  propertyName: string
  city: string
  revenue: number
  expenses: number
  profit: number
  margin: number
  nights: number
  bookings: number
}

interface ProfitabilityTableProps {
  data: PropertyProfit[]
}

export function ProfitabilityTable({ data }: ProfitabilityTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rentabilité par logement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ajoutez des logements pour voir la rentabilité
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rentabilité par logement</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logement</TableHead>
              <TableHead className="text-right">Revenus</TableHead>
              <TableHead className="text-right">Dépenses</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Marge</TableHead>
              <TableHead className="text-center">Nuits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.propertyId}>
                <TableCell>
                  <div>
                    <span className="font-medium">{row.propertyName}</span>
                    <p className="text-xs text-muted-foreground">{row.city}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right text-green-400">
                  {formatCurrency(row.revenue)}
                </TableCell>
                <TableCell className="text-right text-red-400">
                  {formatCurrency(row.expenses)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(row.profit)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      row.margin >= 30
                        ? "text-green-400"
                        : row.margin >= 10
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    {row.margin}%
                  </span>
                </TableCell>
                <TableCell className="text-center">{row.nights}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
