import { Outlet, Link, useLocation } from "react-router"
import {
  Home,
  Activity,
  FileText,
  Calendar,
  Bell,
  Settings,
  LogOut
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Movimientos", path: "/ingresos", icon: Activity },
  { name: "Reportes", path: "/reportes", icon: FileText },
  { name: "Calendario", path: "/calendario", icon: Calendar },
]

export function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-[#F4F0EA] p-4 lg:p-8 gap-6 font-sans text-[#1A1B20] overflow-hidden">

      {/* Floating Sidebar Container */}
      <aside className="w-20 flex-shrink-0 flex flex-col gap-4 z-10 h-full pb-4">

        {/* Main Nav Pill */}
        <div className="bg-white rounded-full flex flex-col items-center py-6 px-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex-1 max-h-[600px]">
          {/* Logo */}
          <div className="w-12 h-12 flex items-center justify-center mb-8">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L2 10L16 18L30 10L16 2Z" fill="#1A1B20"/>
              <path d="M2 22L16 30L30 22" stroke="#1A1B20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-3 w-full items-center">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={item.name}
                  className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-[#1A1B20] text-[#FFD240] shadow-md transform scale-105"
                      : "text-gray-400 hover:text-[#1A1B20] hover:bg-gray-50"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
                </Link>
              )
            })}

            <div className="w-8 h-px bg-gray-100 my-2"></div>

            <button className="w-14 h-14 flex items-center justify-center rounded-full text-gray-400 hover:text-[#1A1B20] hover:bg-gray-50 transition-all">
              <Settings size={22} />
            </button>
          </nav>
        </div>

        {/* Profile Pill */}
        <div className="bg-white rounded-[2rem] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mt-auto flex flex-col items-center gap-4 py-4">
          <button className="text-gray-400 hover:text-[#1A1B20] transition-colors">
            <LogOut size={20} />
          </button>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        <Outlet />
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
      `}</style>
    </div>
  )
}
