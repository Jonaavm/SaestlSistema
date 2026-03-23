import * as React from "react"
import { Eye, EyeOff, Bell, User, Plus } from "lucide-react"
import { Button } from "../components/ui/button"
import { CalendarEvents } from "../components/dashboard/calendar-events"

export default function Calendario() {
  const [isPrivate, setIsPrivate] = React.useState(true)

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans">
      <nav className="sticky top-0 z-50 w-full border-b border-[#EBE5D9]/50 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-20 h-10 rounded-full bg-gradient-to-tr from-[#800020] to-[#D4AF37] flex items-center justify-center text-white font-bold text-lg shadow-md">
              SAESTL
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#3D3325]">Finanzas Alumnos</h1>
              <p className="text-xs font-medium text-[#8D8271]">Sistema de Control Universitario</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrivate(!isPrivate)}
              className="gap-2 rounded-full border-[#EBE5D9] shadow-sm hidden sm:flex"
            >
              {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPrivate ? "Mostrar Valores" : "Ocultar Valores"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPrivate(!isPrivate)}
              className="rounded-full border-[#EBE5D9] shadow-sm sm:hidden"
            >
              {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="text-[#8D8271] hover:text-[#3D3325] hover:bg-[#FAF7F2] rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="h-9 w-9 rounded-full bg-[#EBE5D9] flex items-center justify-center text-[#8D8271] border-2 border-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#3D3325] mb-2">Calendario</h2>
            <p className="text-[#8D8271]">Planificación de eventos, fechas de corte y reuniones importantes.</p>
          </div>
          <Button className="shadow-lg shadow-[#800020]/20 rounded-full gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </Button>
        </header>

        <CalendarEvents />
      </main>
    </div>
  )
}