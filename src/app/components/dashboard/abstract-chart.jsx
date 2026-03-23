import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
  { name: "Ene", income: 12000, expense: 4000 },
  { name: "Feb", income: 18000, expense: 7000 },
  { name: "Mar", income: 15000, expense: 5000 },
  { name: "Abr", income: 24000, expense: 8000 },
  { name: "May", income: 22000, expense: 9000 },
  { name: "Jun", income: 30000, expense: 12000 },
]

const CustomTooltip = ({ active, payload, label, isPrivate }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-[1rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#EBE5D9]">
        <p className="font-semibold text-[#3D3325] mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[#8D8271]">{entry.name === "income" ? "Ingresos: " : "Egresos: "}</span>
              <span className="font-medium text-[#3D3325]">
                {isPrivate ? "****" : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(entry.value)}
              </span>
            </p>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function AbstractChart({ isPrivate }) {
  return (
    <Card className="col-span-1 lg:col-span-2 bg-white">
      <CardHeader>
        <CardTitle className="text-[#3D3325] text-lg font-bold">Flujo Financiero</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#800020" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#800020" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE5D9" opacity={0.5} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8D8271', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8D8271', fontSize: 12 }}
                tickFormatter={(value) => isPrivate ? "****" : `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip isPrivate={isPrivate} />} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#D4AF37"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIncome)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#D4AF37" }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#800020"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorExpense)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#800020" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
