import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts"
import { Calendar, TrendingUp } from "lucide-react"
import { useFinancialOverview } from "../../hooks/useFinancialOverview"
import { buildCsv, downloadTextFile, toIsoDate } from "../../lib/downloadUtils"

export function ReportsAnalytics({ isPrivate }) {
  const { overview } = useFinancialOverview()
  const [dateRange, setDateRange] = React.useState({
    from: "2026-03-01",
    to: "2026-03-31",
  })
  const [appliedRange, setAppliedRange] = React.useState({
    from: "2026-03-01",
    to: "2026-03-31",
  })
  const [rangeError, setRangeError] = React.useState("")

  const allMovements = overview?.detailedMovements ?? []

  const filteredMovements = React.useMemo(() => {
    return allMovements.filter((movement) => {
      const movementDate = toIsoDate(movement.date)
      if (!movementDate) return false
      if (appliedRange.from && movementDate < appliedRange.from) return false
      if (appliedRange.to && movementDate > appliedRange.to) return false
      return true
    })
  }, [allMovements, appliedRange])

  const aggregateByCategory = React.useCallback((list, type) => {
    const categoryMap = new Map()
    list.forEach((movement) => {
      if (movement.type !== type) return
      const key = movement.category || "Otros"
      categoryMap.set(key, (categoryMap.get(key) || 0) + Number(movement.amount || 0))
    })

    return [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
  }, [])

  const expensesByCategory = React.useMemo(
    () => aggregateByCategory(filteredMovements, "expense"),
    [aggregateByCategory, filteredMovements]
  )

  const incomeByType = React.useMemo(
    () => aggregateByCategory(filteredMovements, "income"),
    [aggregateByCategory, filteredMovements]
  )

  const monthlyData = React.useMemo(() => {
    const monthMap = new Map()

    filteredMovements.forEach((movement) => {
      const parsedDate = new Date(movement.date)
      if (Number.isNaN(parsedDate.getTime())) return
      const monthKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = parsedDate.toLocaleDateString("es-MX", { month: "short", year: "2-digit" })
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { month: monthLabel, income: 0, expense: 0, profit: 0 })
      }

      const row = monthMap.get(monthKey)
      if (movement.type === "income") {
        row.income += Number(movement.amount || 0)
      } else {
        row.expense += Number(movement.amount || 0)
      }
      row.profit = row.income - row.expense
    })

    return [...monthMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((entry) => entry[1])
  }, [filteredMovements])

  const summary = React.useMemo(() => {
    const totalIncome = filteredMovements
      .filter((movement) => movement.type === "income")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0)
    const totalExpense = filteredMovements
      .filter((movement) => movement.type === "expense")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0)

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    }
  }, [filteredMovements])

  const stats = [
    { label: "Ingresos Totales", value: summary.totalIncome, color: "#2E7D32" },
    { label: "Egresos Totales", value: summary.totalExpense, color: "#C62828" },
    { label: "Ganancia Neta", value: summary.balance, color: "#800020" },
    {
      label: "Promedio Diario",
      value: filteredMovements.length > 0 ? Math.round(summary.balance / Math.max(1, monthlyData.length * 30)) : 0,
      color: "#D4AF37",
    },
  ]

  const COLORS = ["#D4AF37", "#800020", "#2E7D32", "#8D8271"]
  const INCOME_COLORS = ["#D4AF37", "#FFA726", "#EF5350", "#78909C"]

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

  const handleApplyFilter = () => {
    if (dateRange.from && dateRange.to && dateRange.from > dateRange.to) {
      setRangeError("La fecha inicial no puede ser mayor que la fecha final")
      return
    }
    setRangeError("")
    setAppliedRange({ ...dateRange })
  }

  const handleDownloadCsv = React.useCallback(() => {
    const headers = [
      { key: "date", label: "Fecha" },
      { key: "type", label: "Tipo" },
      { key: "category", label: "Categoria" },
      { key: "concept", label: "Concepto" },
      { key: "amount", label: "Monto" },
      { key: "responsible", label: "Responsable" },
      { key: "status", label: "Estado" },
    ]

    const csvRows = filteredMovements.map((movement) => ({
      ...movement,
      amount: Number(movement.amount || 0).toFixed(2),
    }))

    const csv = buildCsv(csvRows, headers)
    const filename = `reporte-financiero-${appliedRange.from || 'inicio'}-${appliedRange.to || 'hoy'}.csv`
    downloadTextFile(filename, csv, "text/csv;charset=utf-8")
  }, [appliedRange.from, appliedRange.to, filteredMovements])

  const handlePrintPdf = React.useCallback(() => {
    const reportWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700")
    if (!reportWindow) return

    const rowsHtml = filteredMovements
      .map((movement) => `
        <tr>
          <td>${toIsoDate(movement.date)}</td>
          <td>${movement.type}</td>
          <td>${movement.category || "-"}</td>
          <td>${movement.concept || "-"}</td>
          <td>$${Number(movement.amount || 0).toFixed(2)}</td>
        </tr>
      `)
      .join("")

    reportWindow.document.write(`
      <html>
        <head>
          <title>Reporte Financiero SAESTL</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h1 { margin-bottom: 4px; }
            p { margin-top: 0; color: #555; }
            .summary { margin: 16px 0; }
            .summary div { margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Reporte Financiero SAESTL</h1>
          <p>Rango: ${appliedRange.from || "sin inicio"} a ${appliedRange.to || "sin fin"}</p>
          <div class="summary">
            <div><strong>Ingresos:</strong> $${summary.totalIncome.toFixed(2)}</div>
            <div><strong>Egresos:</strong> $${summary.totalExpense.toFixed(2)}</div>
            <div><strong>Balance:</strong> $${summary.balance.toFixed(2)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Concepto</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `)
    reportWindow.document.close()
    reportWindow.focus()
    reportWindow.print()
  }, [appliedRange.from, appliedRange.to, filteredMovements, summary.balance, summary.totalExpense, summary.totalIncome])

  React.useEffect(() => {
    const handleExternalDownload = () => handleDownloadCsv()
    window.addEventListener("saestl:download-report", handleExternalDownload)
    return () => window.removeEventListener("saestl:download-report", handleExternalDownload)
  }, [handleDownloadCsv])

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
              <Button onClick={handleApplyFilter} className="shadow-lg shadow-[#800020]/20 rounded-full w-full">
                Aplicar Filtro
              </Button>
            </div>
          </div>
          {rangeError && <p className="text-sm text-red-700 mt-3">{rangeError}</p>}
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
          <Button onClick={handlePrintPdf} className="bg-white text-[#800020] hover:bg-white/90 rounded-full">
            Descargar PDF
          </Button>
          <Button onClick={handleDownloadCsv} className="bg-white text-[#800020] hover:bg-white/90 rounded-full">
            Descargar CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
