import { createServer } from 'node:http'
import {
  authenticateUser,
  cleanupExpiredSessions,
  createDatabaseBackup,
  createSession,
  deleteSession,
  getEvents,
  getMovementAudit,
  getMovements,
  getSessionByToken,
  insertEvent,
  insertMovement,
  listDatabaseBackups,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeMovement,
  updateMovement,
  getNotificationsForUser,
} from './database.js'

const PORT = process.env.PORT || 3001
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function parseDate(dateString) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

function calculateHealthIndicators(movements) {
  const income = movements
    .filter((movement) => movement.type === 'income')
    .reduce((sum, movement) => sum + Number(movement.amount || 0), 0)
  const expense = movements
    .filter((movement) => movement.type === 'expense')
    .reduce((sum, movement) => sum + Number(movement.amount || 0), 0)

  const net = income - expense
  const savingsRate = income > 0 ? (net / income) * 100 : 0
  const expenseRatio = income > 0 ? (expense / income) * 100 : 0

  const monthly = new Map()
  movements.forEach((movement) => {
    const parsedDate = parseDate(movement.date)
    if (!parsedDate) return
    const key = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
    if (!monthly.has(key)) {
      monthly.set(key, { income: 0, expense: 0 })
    }
    const row = monthly.get(key)
    if (movement.type === 'income') row.income += Number(movement.amount || 0)
    else row.expense += Number(movement.amount || 0)
  })

  const activeMonths = [...monthly.values()]
  const avgMonthlyExpense = activeMonths.length > 0
    ? activeMonths.reduce((sum, row) => sum + row.expense, 0) / activeMonths.length
    : 0

  const runwayMonths = avgMonthlyExpense > 0 ? net / avgMonthlyExpense : 0

  const status = savingsRate >= 20
    ? 'saludable'
    : savingsRate >= 5
      ? 'estable'
      : 'riesgo'

  return {
    savingsRate: Number(savingsRate.toFixed(1)),
    expenseRatio: Number(expenseRatio.toFixed(1)),
    runwayMonths: Number(runwayMonths.toFixed(1)),
    status,
  }
}

function buildOverview(movements, events = []) {
  const sorted = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date))
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthMovements = movements.filter((movement) => {
    const movementDate = parseDate(movement.date)
    return movementDate && movementDate.getMonth() === currentMonth && movementDate.getFullYear() === currentYear
  })

  const previousMonthMovements = movements.filter((movement) => {
    const movementDate = parseDate(movement.date)
    if (!movementDate) return false
    const previous = new Date(currentYear, currentMonth - 1, 1)
    return movementDate.getMonth() === previous.getMonth() && movementDate.getFullYear() === previous.getFullYear()
  })

  const sumByType = (list, type) => list
    .filter((item) => item.type === type)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const totalIncome = sumByType(movements, 'income')
  const totalExpense = sumByType(movements, 'expense')
  const currentIncome = sumByType(currentMonthMovements, 'income')
  const currentExpense = sumByType(currentMonthMovements, 'expense')
  const previousIncome = sumByType(previousMonthMovements, 'income')
  const previousExpense = sumByType(previousMonthMovements, 'expense')

  const percentChange = (currentValue, previousValue) => {
    if (!previousValue) return currentValue > 0 ? 100 : 0
    return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1))
  }

  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const income = sumByType(movements.filter((movement) => {
      const date = parseDate(movement.date)
      return date && date.getMonth() === index
    }), 'income')

    const expense = sumByType(movements.filter((movement) => {
      const date = parseDate(movement.date)
      return date && date.getMonth() === index
    }), 'expense')

    return {
      month: monthNames[index],
      income,
      expense,
      profit: income - expense,
    }
  })

  const aggregateBy = (field) => {
    const map = new Map()
    movements.forEach((movement) => {
      const key = movement[field] || 'Otros'
      map.set(key, (map.get(key) || 0) + Number(movement.amount || 0))
    })

    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
  }

  const movementEvents = sorted
    .slice(0, 15)
    .map((movement) => {
      const date = parseDate(movement.date)
      return {
        id: `m-${movement.id}`,
        dateISO: movement.date,
        date: date ? date.getDate() : null,
        title: movement.concept,
        type: movement.type,
        time: '—',
        responsible: movement.responsible || '—',
        amount: movement.amount,
        category: movement.category,
      }
    })
    .filter((event) => event.date !== null)

  const customEvents = events
    .map((eventItem) => {
      const date = parseDate(eventItem.date)
      return {
        id: `e-${eventItem.id}`,
        dateISO: eventItem.date,
        date: date ? date.getDate() : null,
        title: eventItem.title,
        type: eventItem.type || 'event',
        time: eventItem.time || '—',
        location: eventItem.location || '',
        responsible: eventItem.responsible || '—',
      }
    })
    .filter((event) => event.date !== null)

  const calendarEvents = [...customEvents, ...movementEvents].sort((a, b) => {
    const aDate = parseDate(a.dateISO)
    const bDate = parseDate(b.dateISO)
    if (!aDate || !bDate) return 0
    return aDate - bDate
  })

  return {
    kpis: [
      {
        title: 'Balance Total',
        amount: totalIncome - totalExpense,
        trend: percentChange(currentIncome - currentExpense, previousIncome - previousExpense),
        type: 'balance',
      },
      {
        title: 'Ingresos (Mes)',
        amount: currentIncome,
        trend: percentChange(currentIncome, previousIncome),
        type: 'income',
      },
      {
        title: 'Egresos (Mes)',
        amount: currentExpense,
        trend: percentChange(currentExpense, previousExpense),
        type: 'expense',
      },
    ],
    monthlyData,
    expensesByCategory: aggregateBy('category').filter((item) => movements.find((movement) => movement.category === item.name && movement.type === 'expense')),
    incomeByType: aggregateBy('category').filter((item) => movements.find((movement) => movement.category === item.name && movement.type === 'income')),
    recentMovements: sorted.slice(0, 5),
    detailedMovements: sorted,
    calendarEvents,
    healthIndicators: calculateHealthIndicators(movements),
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      currentIncome,
      currentExpense,
      currentBalance: currentIncome - currentExpense,
    },
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1e6) {
        reject(new Error('Body too large'))
        req.destroy()
      }
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return null
  return authHeader.slice('Bearer '.length).trim()
}

function requireAuth(req, res) {
  const token = getTokenFromRequest(req)
  const session = getSessionByToken(token)
  if (!session) {
    sendJson(res, 401, { error: 'No autorizado' })
    return null
  }
  return session
}

function requireRole(session, res, roles) {
  if (!roles.includes(session.user.role)) {
    sendJson(res, 403, { error: 'Sin permisos para esta accion' })
    return false
  }
  return true
}

cleanupExpiredSessions()
setInterval(cleanupExpiredSessions, 1000 * 60 * 30)

createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Bad request' })
    return
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    res.end()
    return
  }

  if (req.url === '/api/health') {
    sendJson(res, 200, { ok: true, db: 'sqlite' })
    return
  }

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    try {
      const rawBody = await readBody(req)
      const payload = rawBody ? JSON.parse(rawBody) : {}
      const username = String(payload.username || '').trim()
      const password = String(payload.password || '')

      if (!username || !password) {
        sendJson(res, 400, { error: 'Usuario y contrasena son requeridos' })
        return
      }

      const user = authenticateUser(username, password)
      if (!user) {
        sendJson(res, 401, { error: 'Credenciales invalidas' })
        return
      }

      const session = createSession(user.id)
      sendJson(res, 200, {
        message: 'Inicio de sesion exitoso',
        token: session.token,
        expiresAt: session.expiresAt,
        user,
      })
    } catch (error) {
      sendJson(res, 400, { error: 'No se pudo iniciar sesion', details: error.message })
    }
    return
  }

  if (req.url === '/api/auth/me' && req.method === 'GET') {
    const session = requireAuth(req, res)
    if (!session) return
    sendJson(res, 200, { user: session.user, expiresAt: session.expiresAt })
    return
  }

  if (req.url === '/api/auth/logout' && req.method === 'POST') {
    const token = getTokenFromRequest(req)
    if (token) deleteSession(token)
    sendJson(res, 200, { message: 'Sesion cerrada' })
    return
  }

  const session = requireAuth(req, res)
  if (!session) return

  if (req.url === '/api/overview' && req.method === 'GET') {
    sendJson(res, 200, buildOverview(getMovements(), getEvents()))
    return
  }

  if (req.url === '/api/movements' && req.method === 'GET') {
    if (!requireRole(session, res, ['admin', 'tesoreria'])) return
    sendJson(res, 200, { movements: getMovements() })
    return
  }

  if (req.url === '/api/movements' && req.method === 'POST') {
    if (!requireRole(session, res, ['admin', 'tesoreria'])) return

    try {
      const rawBody = await readBody(req)
      const payload = rawBody ? JSON.parse(rawBody) : {}
      const required = ['date', 'concept', 'type', 'category', 'amount']
      const missing = required.filter((key) => payload[key] === undefined || payload[key] === null || payload[key] === '')

      if (missing.length > 0) {
        sendJson(res, 400, { error: `Faltan campos requeridos: ${missing.join(', ')}` })
        return
      }

      const date = parseDate(payload.date)
      const amount = Number(payload.amount)
      if (!date) {
        sendJson(res, 400, { error: 'La fecha no es valida' })
        return
      }
      if (!['income', 'expense'].includes(payload.type)) {
        sendJson(res, 400, { error: 'El tipo debe ser income o expense' })
        return
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        sendJson(res, 400, { error: 'El monto debe ser mayor a cero' })
        return
      }

      const movement = insertMovement({
        date: payload.date,
        concept: String(payload.concept).trim(),
        type: payload.type,
        category: String(payload.category).trim(),
        amount,
        responsible: String(payload.responsible || '').trim(),
        notes: String(payload.notes || '').trim(),
        status: 'completed',
      }, session.user)

      sendJson(res, 201, {
        message: 'Movimiento registrado correctamente',
        movement,
        overview: buildOverview(getMovements(), getEvents()),
      })
    } catch (error) {
      sendJson(res, 400, { error: 'No se pudo guardar el movimiento', details: error.message })
    }
    return
  }

  const movementIdMatch = req.url.match(/^\/api\/movements\/(\d+)$/)
  if (movementIdMatch && req.method === 'PUT') {
    if (!requireRole(session, res, ['admin', 'tesoreria'])) return

    try {
      const movementId = Number(movementIdMatch[1])
      const rawBody = await readBody(req)
      const payload = rawBody ? JSON.parse(rawBody) : {}

      if (payload.amount !== undefined && (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0)) {
        sendJson(res, 400, { error: 'Monto invalido' })
        return
      }

      const updated = updateMovement(movementId, payload, session.user)
      if (!updated) {
        sendJson(res, 404, { error: 'Movimiento no encontrado' })
        return
      }

      sendJson(res, 200, {
        message: 'Movimiento actualizado',
        movement: updated,
        overview: buildOverview(getMovements(), getEvents()),
      })
    } catch (error) {
      sendJson(res, 400, { error: 'No se pudo actualizar movimiento', details: error.message })
    }
    return
  }

  if (movementIdMatch && req.method === 'DELETE') {
    if (!requireRole(session, res, ['admin'])) return
    const movementId = Number(movementIdMatch[1])

    const deleted = removeMovement(movementId, session.user)
    if (!deleted) {
      sendJson(res, 404, { error: 'Movimiento no encontrado' })
      return
    }

    sendJson(res, 200, {
      message: 'Movimiento eliminado',
      overview: buildOverview(getMovements(), getEvents()),
    })
    return
  }

  const movementAuditMatch = req.url.match(/^\/api\/movements\/(\d+)\/audit$/)
  if (movementAuditMatch && req.method === 'GET') {
    if (!requireRole(session, res, ['admin', 'tesoreria'])) return
    const movementId = Number(movementAuditMatch[1])
    sendJson(res, 200, { history: getMovementAudit(movementId) })
    return
  }

  if (req.url === '/api/events' && req.method === 'GET') {
    if (!requireRole(session, res, ['admin', 'tesoreria'])) return
    sendJson(res, 200, { events: getEvents() })
    return
  }

  if (req.url === '/api/events' && req.method === 'POST') {
    if (!requireRole(session, res, ['admin'])) return

    try {
      const rawBody = await readBody(req)
      const payload = rawBody ? JSON.parse(rawBody) : {}
      const required = ['date', 'title', 'type']
      const missing = required.filter((key) => payload[key] === undefined || payload[key] === null || payload[key] === '')

      if (missing.length > 0) {
        sendJson(res, 400, { error: `Faltan campos requeridos: ${missing.join(', ')}` })
        return
      }

      const date = parseDate(payload.date)
      const allowedTypes = ['event', 'meeting', 'deadline', 'closing']
      if (!date) {
        sendJson(res, 400, { error: 'La fecha no es valida' })
        return
      }
      if (!allowedTypes.includes(payload.type)) {
        sendJson(res, 400, { error: 'Tipo de evento no valido' })
        return
      }

      const event = insertEvent({
        date: payload.date,
        title: String(payload.title).trim(),
        type: payload.type,
        time: String(payload.time || '').trim(),
        location: String(payload.location || '').trim(),
        responsible: String(payload.responsible || '').trim(),
      }, session.user)

      sendJson(res, 201, {
        message: 'Evento registrado correctamente',
        event,
        overview: buildOverview(getMovements(), getEvents()),
      })
    } catch (error) {
      sendJson(res, 400, { error: 'No se pudo guardar el evento', details: error.message })
    }
    return
  }

  if (req.url === '/api/notifications' && req.method === 'GET') {
    const notifications = getNotificationsForUser(session.user)
    const unreadCount = notifications.filter((item) => !item.is_read).length
    sendJson(res, 200, { notifications, unreadCount })
    return
  }

  const notificationReadMatch = req.url.match(/^\/api\/notifications\/(\d+)\/read$/)
  if (notificationReadMatch && req.method === 'POST') {
    markNotificationAsRead(Number(notificationReadMatch[1]), session.user.id)
    sendJson(res, 200, { message: 'Notificacion marcada como leida' })
    return
  }

  if (req.url === '/api/notifications/read-all' && req.method === 'POST') {
    markAllNotificationsAsRead(session.user.id, session.user.role)
    sendJson(res, 200, { message: 'Todas las notificaciones marcadas como leidas' })
    return
  }

  if (req.url === '/api/backups' && req.method === 'POST') {
    if (!requireRole(session, res, ['admin'])) return
    const backup = createDatabaseBackup(session.user)
    sendJson(res, 201, { message: 'Respaldo generado', backup })
    return
  }

  if (req.url === '/api/backups' && req.method === 'GET') {
    if (!requireRole(session, res, ['admin'])) return
    sendJson(res, 200, { backups: listDatabaseBackups() })
    return
  }

  sendJson(res, 404, { error: 'Ruta no encontrada' })
}).listen(PORT, () => {
  console.log(`Backend listo en http://localhost:${PORT} (SQLite + Roles + Auditoria)`)
})
