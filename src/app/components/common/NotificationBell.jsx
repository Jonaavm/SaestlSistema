import * as React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '../ui/button'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../lib/financialApi'

export function NotificationBell() {
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState([])
  const [unreadCount, setUnreadCount] = React.useState(0)

  const loadNotifications = React.useCallback(async () => {
    try {
      const response = await getNotifications()
      setNotifications(response.notifications || [])
      setUnreadCount(response.unreadCount || 0)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [])

  React.useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleToggle = async () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      await loadNotifications()
    }
  }

  const handleReadAll = async () => {
    await markAllNotificationsRead()
    await loadNotifications()
  }

  const handleMarkRead = async (notificationId) => {
    await markNotificationRead(notificationId)
    await loadNotifications()
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="text-[#8D8271] hover:text-[#3D3325] hover:bg-[#FAF7F2] rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#800020] text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-2xl border border-[#EBE5D9] bg-white shadow-xl p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-[#3D3325]">Notificaciones</h4>
            <Button variant="ghost" size="sm" onClick={handleReadAll} className="text-xs">Marcar todo</Button>
          </div>

          <div className="space-y-2">
            {notifications.length === 0 && (
              <p className="text-sm text-[#8D8271] py-3">Sin notificaciones</p>
            )}

            {notifications.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMarkRead(item.id)}
                className={`w-full text-left rounded-xl p-3 border transition-colors ${item.is_read ? 'bg-[#FAF7F2] border-[#EBE5D9]' : 'bg-white border-[#D4AF37]'} `}
              >
                <p className="text-sm font-semibold text-[#3D3325]">{item.title}</p>
                <p className="text-xs text-[#8D8271] mt-1">{item.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
