import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react"
import { useFinancialOverview } from "../../hooks/useFinancialOverview"

export function CalendarEvents() {
  const { overview } = useFinancialOverview()
  const [currentDate, setCurrentDate] = React.useState(new Date())

  const events = React.useMemo(() => {
    const list = overview?.calendarEvents ?? []
    return [...list].sort((a, b) => {
      const aDate = new Date(a.dateISO || `${new Date().getFullYear()}-01-${String(a.date || 1).padStart(2, '0')}`)
      const bDate = new Date(b.dateISO || `${new Date().getFullYear()}-01-${String(b.date || 1).padStart(2, '0')}`)
      return aDate - bDate
    })
  }, [overview])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"]
  const dates = []

  // Llenar días vacíos al inicio
  for (let i = 0; i < firstDayOfMonth; i++) {
    dates.push(null)
  }
  // Llenar días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(i)
  }

  const getEventsForDate = (date) => events.filter((eventItem) => {
    if (eventItem.dateISO) {
      const parsed = new Date(eventItem.dateISO)
      return parsed.getDate() === date &&
        parsed.getMonth() === currentDate.getMonth() &&
        parsed.getFullYear() === currentDate.getFullYear()
    }
    return eventItem.date === date
  })

  const getEventTypeStyles = (type) => {
    switch (type) {
      case "expense":
      case "deadline":
        return "bg-[#FDF2F2] border-l-4 border-[#C62828]"
      case "income":
        return "bg-[#EFF6FF] border-l-4 border-[#2196F3]"
      case "closing":
        return "bg-[#F3F4F6] border-l-4 border-[#800020]"
      case "event":
        return "bg-[#EFF6FF] border-l-4 border-[#2196F3]"
      case "meeting":
        return "bg-[#F0FDF4] border-l-4 border-[#2E7D32]"
      default:
        return "bg-[#FAF7F2] border-l-4 border-[#D4AF37]"
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case "expense":
      case "deadline":
        return "text-[#C62828]"
      case "income":
        return "text-[#2196F3]"
      case "closing":
        return "text-[#800020]"
      case "event":
        return "text-[#2196F3]"
      case "meeting":
        return "text-[#2E7D32]"
      default:
        return "text-[#D4AF37]"
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  return (
    <div className="space-y-6">
      {/* Calendario */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#EBE5D9]">
          <CardTitle className="text-[#3D3325] text-lg font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#800020]" />
            Calendario de Eventos
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8 text-[#8D8271] hover:text-[#800020]">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-[#8D8271] hover:text-[#800020]">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Mes y año */}
          <div className="text-center font-bold text-lg text-[#3D3325] mb-4 capitalize">
            {monthName}
          </div>

          {/* Días semana */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-[#8D8271] mb-2">
            {days.map(day => <div key={day}>{day}</div>)}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date, idx) => {
              const dayEvents = date ? getEventsForDate(date) : []
              const hasEvents = dayEvents.length > 0
              const today = new Date()
              const isToday = date === today.getDate() && 
                             currentDate.getMonth() === today.getMonth() && 
                             currentDate.getFullYear() === today.getFullYear()

              return (
                <div key={idx} className="min-h-[100px] p-2 rounded-lg border-2 border-[#EBE5D9] hover:border-[#800020] transition-colors">
                  {date && (
                    <>
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'bg-[#800020] text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-[#3D3325]'}`}>
                        {date}
                      </div>
                      {hasEvents && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div key={event.id} className={`text-xs p-1 rounded border-l-2 ${
                              event.type === 'deadline' ? 'border-l-[#C62828] bg-[#FDF2F2]' :
                              event.type === 'closing' ? 'border-l-[#800020] bg-[#F3F4F6]' :
                              event.type === 'event' ? 'border-l-[#2196F3] bg-[#EFF6FF]' :
                              event.type === 'meeting' ? 'border-l-[#2E7D32] bg-[#F0FDF4]' :
                              'border-l-[#D4AF37] bg-[#FAF7F2]'
                            }`}>
                              <p className="font-semibold text-[#3D3325] truncate">{event.title}</p>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <p className="text-xs text-[#8D8271] font-medium">+{dayEvents.length - 2} más</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos próximos */}
      <Card className="bg-white">
        <CardHeader className="border-b border-[#EBE5D9]">
          <CardTitle className="text-[#3D3325] text-lg font-bold">Próximos Eventos y Fechas Límite</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {events.map(event => (
            <div key={event.id} className={`p-4 rounded-lg ${getEventTypeStyles(event.type)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-[#3D3325] mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-[#8D8271]">
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.responsible && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{event.responsible}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getEventTypeColor(event.type)} bg-white/50`}>
                  {event.dateISO ? new Date(event.dateISO).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : `${event.date} ${currentDate.toLocaleDateString('es-MX', { month: 'short' })}`}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Leyenda de tipos de eventos */}
      <Card className="bg-[#FDFBF7] border-2 border-dashed border-[#EBE5D9]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#3D3325]">Leyenda de Tipos de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C62828]"></div>
              <span className="text-sm text-[#3D3325]">Fecha Límite</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#800020]"></div>
              <span className="text-sm text-[#3D3325]">Cierre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2196F3]"></div>
              <span className="text-sm text-[#3D3325]">Evento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2E7D32]"></div>
              <span className="text-sm text-[#3D3325]">Reunión</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
