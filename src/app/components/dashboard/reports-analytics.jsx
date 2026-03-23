import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts"
import { Calendar, TrendingUp } from "lucide-react"

export function ReportsAnalytics({ isPrivate }) {
  const [dateRange, setDateRange] = React.useState({
    from: "2026-03-01",
    to: "2026-03-31",
  })

  // Datos por categoría de gastos
  const expensesByCategory = [
    { name: "Eventos", value: 8500 },
    { name: "Papelería", value: 1950 },
    { name: "Tecnología", value: 3500 },
    { name: "Otros", value: 1200 },
  ]

  // Datos de ingresos por tipo
  const incomeByType = [
    { name: "Inscripciones", value: 25000 },
    { name: "Ventas", value: 4200 },
    { name: "Donaciones", value: 15000 },
    { name: "Cuotas", value: 12000 },
  ]

  // Datos mensuales
  const monthlyData = [
    { month: "Ene", income: 12000, expense: 4000, profit: 8000 },
    { month: "Feb", income: 18000, expense: 7000, profit: 11000 },
    { month: "Mar", income: 56200, expense: 14400, profit: 41800 },
    { month: "Abr", income: 24000, expense: 8000, profit: 16000 },
  ]

  // Estadísticas
  const stats = [
    { label: "Ingresos Totales", value: 56200, color: "#2E7D32" },
    { label: "Egresos Totales", value: 14400, color: "#C62828" },
    { label: "Ganancia Neta", value: 41800, color: "#800020" },
    { label: "Promedio Diario", value: 1348, color: "#D4AF37" },
  ]

  const COLORS = ["#D4AF37", "#800020", "#2E7D32", "#8D8271"]
  const INCOME_COLORS = ["#D4AF37", "#FFA726", "#EF5350", "#78909C"]
  const EXPENSE_COLORS = ["#FFE082", "#E57373", "#64B5F6", "#81C784"]

  const CustomTooltip = ({ active, payload, label, isPrivate }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg p-3 shadow-lg border border-[#EBE5D9]">
          <p className="font-semibold text-[#3D3325]">{payload[0].payload.name || label}</p>
          <p className="text-sm text-[#8D8271]">
            {isPrivate ? "****" : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const formatAmount = (amount) => {
    if (isPrivate) return "****"
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Selector de rango de fechas */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-[#3D3325] text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#800020]" />
            Rango de Fechas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-[#8D8271] font-medium mb-2 block">Desde</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="rounded-full border-[#EBE5D9] focus:ring-[#800020] focus:ring-opacity-20"
              />
            </div>
            <div>
              <label className="text-sm text-[#8D8271] font-medium mb-2 block">Hasta</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="rounded-full border-[#EBE5D9] focus:ring-[#800020] focus:ring-opacity-20"
              />
            </div>
            <div className="flex items-end">
              <Button className="shadow-lg shadow-[#800020]/20 rounded-full w-full">
                Aplicar Filtro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-[#8D8271] mb-2">{stat.label}</p>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>
                  {formatAmount(stat.value)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de gastos por categoría */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#3D3325] text-lg font-bold">Egresos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${isPrivate ? "****" : `$${(value / 1000).toFixed(1)}k`}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isPrivate={isPrivate} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {expensesByCategory.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-sm text-[#8D8271]">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-[#3D3325]">{formatAmount(cat.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de ingresos por tipo */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#3D3325] text-lg font-bold">Ingresos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${isPrivate ? "****" : `$${(value / 1000).toFixed(1)}k`}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isPrivate={isPrivate} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {incomeByType.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: INCOME_COLORS[idx] }}></div>
                    <span className="text-sm text-[#8D8271]">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-[#3D3325]">{formatAmount(cat.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendencia mensual */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-[#3D3325] text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#800020]" />
            Tendencia Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE5D9" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8D8271', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8D8271', fontSize: 12 }}
                  tickFormatter={(value) => isPrivate ? "****" : `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip isPrivate={isPrivate} />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    const labels = {
                      income: "Ingresos",
                      expense: "Egresos",
                      profit: "Ganancia Neta"
                    }
                    return labels[value] || value
                  }}
                />
                <Bar dataKey="income" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#800020" radius={[8, 8, 0, 0]} />
                <Bar dataKey="profit" fill="#2E7D32" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Exportar reporte */}
      <Card className="bg-gradient-to-r from-[#800020] to-[#D4AF37] text-white">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Exportar Reporte Completo</h3>
            <p className="text-sm opacity-90">Genera un PDF con todos los datos del período seleccionado</p>
          </div>
          <Button className="bg-white text-[#800020] hover:bg-white/90 rounded-full">
            Descargar PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
