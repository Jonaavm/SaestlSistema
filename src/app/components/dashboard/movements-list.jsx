import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ArrowDownLeft, ArrowUpRight, CircleCheck, Search } from "lucide-react"
import { Button } from "../ui/button"
import { useFinancialOverview } from "../../hooks/useFinancialOverview"

export function MovementsList({ isPrivate }) {
  const { overview } = useFinancialOverview()
  const transactions = overview?.recentMovements?.map((movement) => ({
    id: movement.id,
    type: movement.type,
    description: movement.concept,
    amount: movement.amount,
    date: movement.date,
    status: movement.status,
  })) ?? []

  const formatAmount = (amount, type) => {
    if (isPrivate) return "****"
    const formatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
    return type === "income" ? `+${formatted}` : `-${formatted}`
  }

  const formatDate = (dateString) => {
    const parsed = new Date(dateString)
    return Number.isNaN(parsed.getTime()) ? String(dateString) : parsed.toLocaleDateString('es-MX')
  }

  return (
    <Card className="col-span-1 lg:col-span-3 bg-white">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 space-y-4 sm:space-y-0 border-b border-[#EBE5D9]">
        <CardTitle className="text-[#3D3325] text-lg font-bold">Movimientos Recientes</CardTitle>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D8271]" />
            <input
              type="text"
              placeholder="Buscar movimiento..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#FAF7F2] border border-[#EBE5D9] rounded-full focus:outline-none focus:ring-2 focus:ring-[#800020] focus:ring-opacity-20 transition-all text-[#3D3325]"
            />
          </div>
          <Button variant="outline" className="hidden sm:inline-flex">Filtrar</Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {transactions.map(txn => (
            <div key={txn.id} className="flex items-center justify-between p-3 sm:p-4 rounded-3xl hover:bg-[#FAF7F2] transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full flex-shrink-0 shadow-sm ${txn.type === 'income' ? 'bg-[#F2F8F3] text-[#2E7D32]' : 'bg-[#FDF2F2] text-[#C62828]'}`}>
                  {txn.type === 'income' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-[#3D3325]">{txn.description}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#8D8271]">{formatDate(txn.date)}</span>
                    <span className="w-1 h-1 rounded-full bg-[#EBE5D9]"></span>
                    <span className="flex items-center text-xs text-[#2E7D32] font-medium">
                      <CircleCheck className="h-3 w-3 mr-1" /> Completado
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${txn.type === 'income' ? 'text-[#2E7D32]' : 'text-[#3D3325]'}`}>
                  {formatAmount(txn.amount, txn.type)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="ghost" className="text-[#800020] hover:text-[#800020] hover:bg-[#FAF7F2]">
            Ver todos los movimientos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
