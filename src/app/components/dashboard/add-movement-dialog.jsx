import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"

export function AddMovementDialog({ isOpen, onOpenChange }) {
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split('T')[0],
    concept: "",
    type: "expense",
    category: "",
    amount: "",
    responsible: "",
    notes: "",
  })

  const categories = {
    income: ["Inscripciones", "Ventas", "Donaciones", "Cuotas", "Otros"],
    expense: ["Eventos", "Papelería", "Tecnología", "Servicios", "Otros"],
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Movimiento añadido:", formData)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      concept: "",
      type: "expense",
      category: "",
      amount: "",
      responsible: "",
      notes: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#3D3325] text-lg font-bold">Registrar Nuevo Movimiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Tipo y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value, category: "" })}>
                <SelectTrigger className="rounded-full border-[#EBE5D9]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Fecha</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
              />
            </div>
          </div>

          {/* Concepto */}
          <div>
            <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Concepto</Label>
            <Input
              type="text"
              placeholder="Ej: Inscripción de alumnos"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
              required
            />
          </div>

          {/* Categoría y Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Categoría</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="rounded-full border-[#EBE5D9]">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {categories[formData.type]?.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Monto ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Responsable */}
          <div>
            <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Responsable</Label>
            <Input
              type="text"
              placeholder="Nombre del responsable"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
            />
          </div>

          {/* Notas */}
          <div>
            <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Notas (Opcional)</Label>
            <Textarea
              placeholder="Añade cualquier detalle adicional..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-2xl border-[#EBE5D9] focus:ring-[#800020]"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full border-[#EBE5D9]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="shadow-lg shadow-[#800020]/20 rounded-full"
            >
              Registrar Movimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
