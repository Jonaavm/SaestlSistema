import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"

export function KPICards({ isPrivate }) {
  const kpis = [
    { title: "Ingresos (Mes)", amount: 45000.50, trend: +8.2, type: "income" },
    { title: "Egresos (Mes)", amount: 15320.00, trend: -4.1, type: "expense" },
  ]

  const formatAmount = (amount) => {
    if (isPrivate) return "****"
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
  }

  const formatTrend = (trend) => {
    if (isPrivate) return "**%"
    return `${Math.abs(trend)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className={kpi.type === "balance" ? "bg-[#800020] text-white border-transparent" : "bg-white"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className={`text-sm font-medium ${kpi.type === "balance" ? "text-white/80" : "text-[#8D8271]"}`}>
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${kpi.type === "balance" ? "bg-white/10 text-[#D4AF37]" : "bg-[#FAF7F2] text-[#800020]"}`}>
              {kpi.type === "balance" && <Wallet className="w-4 h-4" />}
              {kpi.type === "income" && <ArrowUpRight className="w-4 h-4" />}
              {kpi.type === "expense" && <ArrowDownRight className="w-4 h-4" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${kpi.type === "balance" ? "text-white" : "text-[#3D3325]"}`}>
              {formatAmount(kpi.amount)}
            </div>
            <p className={`text-xs mt-2 flex items-center ${kpi.type === "balance" ? "text-white/80" : "text-[#8D8271]"}`}>
              <span className={`flex items-center font-medium mr-1 ${
                isPrivate ? "" :
                kpi.trend > 0 ? (kpi.type === "expense" ? "text-[#C62828]" : "text-[#2E7D32]") : (kpi.type === "expense" ? "text-[#2E7D32]" : "text-[#C62828]")
              }`}>
                {kpi.trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {formatTrend(kpi.trend)}
              </span>
              vs mes anterior
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
