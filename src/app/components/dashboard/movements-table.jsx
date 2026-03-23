import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ArrowDownLeft, ArrowUpRight, Search, Download, ChevronUp, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export function MovementsTable({ isPrivate }) {
  const [movements, setMovements] = React.useState([
    { id: 1, date: "2026-03-22", concept: "Inscripciones Semestre", category: "Ingresos", amount: 25000, responsible: "Tesorera", type: "income", status: "completed" },
    { id: 2, date: "2026-03-20", concept: "Pago Proveedores - Evento Primavera", category: "Eventos", amount: 8500, responsible: "Coordinador Eventos", type: "expense", status: "completed" },
    { id: 3, date: "2026-03-18", concept: "Venta Mercancía Oficial", category: "Ingresos", amount: 4200, responsible: "Tesorera", type: "income", status: "completed" },
    { id: 4, date: "2026-03-15", concept: "Material de Oficina", category: "Papelería", amount: 1200, responsible: "Administrador", type: "expense", status: "completed" },
    { id: 5, date: "2026-03-10", concept: "Hosting Web Anual", category: "Tecnología", amount: 3500, responsible: "Tech Lead", type: "expense", status: "completed" },
    { id: 6, date: "2026-03-08", concept: "Donación Recibida", category: "Donaciones", amount: 15000, responsible: "Presidente", type: "income", status: "completed" },
    { id: 7, date: "2026-03-05", concept: "Banners y Publicidad", category: "Papelería", amount: 750, responsible: "Marketing", type: "expense", status: "completed" },
    { id: 8, date: "2026-03-01", concept: "Cuota Mensual Miembros", category: "Ingresos", amount: 12000, responsible: "Tesorera", type: "income", status: "completed" },
  ])

  const [filters, setFilters] = React.useState({
    search: "",
    type: "all",
    category: "all",
    dateFrom: "",
    dateTo: "",
  })

  const [sortColumn, setSortColumn] = React.useState("date")
  const [sortDirection, setSortDirection] = React.useState("desc")

  const categories = ["Ingresos", "Eventos", "Papelería", "Tecnología", "Donaciones", "Otros"]

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredMovements = movements.filter(m => {
    const matchSearch = m.concept.toLowerCase().includes(filters.search.toLowerCase()) ||
                       m.responsible.toLowerCase().includes(filters.search.toLowerCase())
    const matchType = filters.type === "all" || m.type === filters.type
    const matchCategory = filters.category === "all" || m.category === filters.category
    const matchDateFrom = !filters.dateFrom || m.date >= filters.dateFrom
    const matchDateTo = !filters.dateTo || m.date <= filters.dateTo
    return matchSearch && matchType && matchCategory && matchDateFrom && matchDateTo
  }).sort((a, b) => {
    let compareA = a[sortColumn]
    let compareB = b[sortColumn]
    if (sortColumn === "amount") {
      compareA = parseFloat(compareA)
      compareB = parseFloat(compareB)
    }
    const comparison = compareA > compareB ? 1 : compareA < compareB ? -1 : 0
    return sortDirection === "asc" ? comparison : -comparison
  })

  const formatAmount = (amount, type) => {
    if (isPrivate) return "****"
    const formatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
    return type === "income" ? `+${formatted}` : `-${formatted}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX')
  }

  const SortHeader = ({ column, label }) => (
    <div
      className="flex items-center gap-2 cursor-pointer hover:text-[#800020] transition-colors"
      onClick={() => handleSort(column)}
    >
      {label}
      {sortColumn === column && (
        sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </div>
  )

  return (
    <Card className="col-span-1 lg:col-span-4 bg-white">
      <CardHeader className="border-b border-[#EBE5D9] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[#3D3325] text-lg font-bold">Movimientos Detallados</CardTitle>
          <Button className="shadow-lg shadow-[#800020]/20 rounded-full gap-2" size="sm">
            <Download className="w-4 h-4" />
            Descargar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6 pb-6 border-b border-[#EBE5D9]">
          {/* Búsqueda */}
          <div className="relative col-span-1 md:col-span-2 xl:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D8271]" />
            <Input
              type="text"
              placeholder="Buscar concepto..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9 rounded-full border-[#EBE5D9] focus:ring-[#800020] focus:ring-opacity-20"
            />
          </div>

          {/* Tipo */}
          <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
            <SelectTrigger className="rounded-full border-[#EBE5D9]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Egresos</SelectItem>
            </SelectContent>
          </Select>

          {/* Categoría */}
          <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger className="rounded-full border-[#EBE5D9]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Fecha Desde */}
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="rounded-full border-[#EBE5D9] focus:ring-[#800020] focus:ring-opacity-20"
          />

          {/* Fecha Hasta */}
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="rounded-full border-[#EBE5D9] focus:ring-[#800020] focus:ring-opacity-20"
          />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBE5D9] text-[#8D8271] font-semibold">
                <th className="text-left py-3 px-4"><SortHeader column="date" label="Fecha" /></th>
                <th className="text-left py-3 px-4"><SortHeader column="concept" label="Concepto" /></th>
                <th className="text-left py-3 px-4"><SortHeader column="category" label="Categoría" /></th>
                <th className="text-left py-3 px-4"><SortHeader column="amount" label="Monto" /></th>
                <th className="text-left py-3 px-4"><SortHeader column="responsible" label="Responsable" /></th>
                <th className="text-center py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length > 0 ? (
                filteredMovements.map(movement => (
                  <tr key={movement.id} className="border-b border-[#EBE5D9] hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-4 px-4 text-[#3D3325]">{formatDate(movement.date)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${movement.type === 'income' ? 'bg-[#F2F8F3] text-[#2E7D32]' : 'bg-[#FDF2F2] text-[#C62828]'}`}>
                          {movement.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-[#3D3325]">{movement.concept}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#8D8271]">{movement.category}</td>
                    <td className={`py-4 px-4 font-semibold ${movement.type === 'income' ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                      {formatAmount(movement.amount, movement.type)}
                    </td>
                    <td className="py-4 px-4 text-[#8D8271] text-xs">{movement.responsible}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F2F8F3] text-[#2E7D32] text-xs font-medium">
                        ✓ {movement.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-[#8D8271]">
                    No se encontraron movimientos con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen */}
        <div className="mt-6 pt-6 border-t border-[#EBE5D9] grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-[#8D8271] mb-1">Total Ingresos</p>
            <p className="text-lg font-bold text-[#2E7D32]">
              {isPrivate ? "****" : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                filteredMovements.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0)
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#8D8271] mb-1">Total Egresos</p>
            <p className="text-lg font-bold text-[#C62828]">
              {isPrivate ? "****" : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                filteredMovements.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0)
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#8D8271] mb-1">Balance</p>
            <p className="text-lg font-bold text-[#3D3325]">
              {isPrivate ? "****" : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                filteredMovements.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0) -
                filteredMovements.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0)
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
