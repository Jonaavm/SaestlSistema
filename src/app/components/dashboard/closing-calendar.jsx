import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"

export function ClosingCalendar() {
  const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
  const currentMonth = "Marzo 2026"
  const closingDays = [15, 30]
  const dates = Array.from({ length: 31 }, (_, i) => i + 1)
  const offset = 2

  return (
    <Card className="col-span-1 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#3D3325] text-lg font-bold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#800020]" />
          Días de Cierre
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8D8271]">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8D8271]">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center font-medium text-[#3D3325] mb-4">
          {currentMonth}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-[#8D8271] font-medium">
          {days.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8 w-8"></div>
          ))}
          {dates.map(date => {
            const isClosing = closingDays.includes(date)
            return (
              <div
                key={date}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium mx-auto transition-colors cursor-pointer
                  ${isClosing ? 'bg-[#800020] text-white shadow-md' : 'text-[#3D3325] hover:bg-[#FAF7F2]'}`}
              >
                {date}
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#EBE5D9]">
          <h4 className="text-xs font-semibold text-[#8D8271] uppercase tracking-wider mb-3">Próximos Cierres</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#800020]"></div>
              <div className="flex-1 text-sm font-medium text-[#3D3325]">Quincenal</div>
              <div className="text-xs text-[#8D8271]">15 Mar</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
              <div className="flex-1 text-sm font-medium text-[#3D3325]">Fin de mes</div>
              <div className="text-xs text-[#8D8271]">30 Mar</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
