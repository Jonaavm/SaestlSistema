import { createServer } from 'node:http'
import { getEvents, getMovements, insertEvent, insertMovement } from './database.js'

const PORT = process.env.PORT || 3001
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function parseDate(dateString) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
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
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Bad request' })
    return
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  if (req.url === '/api/health') {
    sendJson(res, 200, { ok: true, db: 'sqlite' })
    return
  }

  if (req.url === '/api/overview' && req.method === 'GET') {
    const movements = getMovements()
    const events = getEvents()
    sendJson(res, 200, buildOverview(movements, events))
    return
  }

  if (req.url === '/api/movements' && req.method === 'GET') {
    sendJson(res, 200, { movements: getMovements() })
    return
  }

  if (req.url === '/api/movements' && req.method === 'POST') {
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

      const newMovement = insertMovement({
        date: payload.date,
        concept: String(payload.concept).trim(),
        type: payload.type,
        category: String(payload.category).trim(),
        amount,
        responsible: String(payload.responsible || '').trim(),
        notes: String(payload.notes || '').trim(),
        status: 'completed',
      })

      sendJson(res, 201, {
        message: 'Movimiento registrado correctamente',
        movement: newMovement,
        overview: buildOverview(getMovements(), getEvents()),
      })
    } catch (error) {
      sendJson(res, 400, { error: 'No se pudo guardar el movimiento', details: error.message })
    }
    return
  }

  if (req.url === '/api/events' && req.method === 'GET') {
    sendJson(res, 200, { events: getEvents() })
    return
  }

  if (req.url === '/api/events' && req.method === 'POST') {
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

      const newEvent = insertEvent({
        date: payload.date,
        title: String(payload.title).trim(),
        type: payload.type,
        time: String(payload.time || '').trim(),
        location: String(payload.location || '').trim(),
        responsible: String(payload.responsible || '').trim(),
      })

      sendJson(res, 201, {
        message: 'Evento registrado correctamente',
        event: newEvent,
        overview: buildOverview(getMovements(), getEvents()),
      })
    } catch (error) {
      sendJson(res, 400, { error: 'No se pudo guardar el evento', details: error.message })
    }
    return
  }

  sendJson(res, 404, { error: 'Ruta no encontrada' })
}).listen(PORT, () => {
  console.log(`Backend listo en http://localhost:${PORT} (SQLite)`)
})
