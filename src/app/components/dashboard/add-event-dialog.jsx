import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useFinancialOverview } from '../../hooks/useFinancialOverview'

const DEFAULT_FORM = {
  title: '',
  date: new Date().toISOString().slice(0, 10),
  type: 'event',
  time: '',
  location: '',
  responsible: '',
}

export function AddEventDialog({ isOpen, onOpenChange }) {
  const { addEvent } = useFinancialOverview()
  const [formData, setFormData] = React.useState(DEFAULT_FORM)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  const resetForm = React.useCallback(() => {
    setFormData(DEFAULT_FORM)
    setError('')
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    addEvent(formData)
      .then(() => {
        resetForm()
        onOpenChange(false)
      })
      .catch((requestError) => {
        setError(requestError.message || 'No se pudo guardar el evento')
      })
      .finally(() => setIsSaving(false))
  }

  const handleOpenChange = (open) => {
    onOpenChange(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#3D3325] text-lg font-bold">Nuevo Evento de Calendario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Título</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Reunión de tesorería"
              className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Fecha</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="rounded-full border-[#EBE5D9]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="meeting">Reunión</SelectItem>
                  <SelectItem value="deadline">Fecha límite</SelectItem>
                  <SelectItem value="closing">Cierre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Hora</Label>
              <Input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="Ej: 10:00 AM"
                className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Responsable</Label>
              <Input
                type="text"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Nombre"
                className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-[#8D8271] mb-2 block">Ubicación</Label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Sala de juntas"
              className="rounded-full border-[#EBE5D9] focus:ring-[#800020]"
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="rounded-full border-[#EBE5D9]">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="shadow-lg shadow-[#800020]/20 rounded-full">
              {isSaving ? 'Guardando...' : 'Guardar Evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
