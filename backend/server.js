import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_FILE = join(__dirname, 'data.json')
const PORT = process.env.PORT || 3001

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const seedData = {
  movements: [
    { id: 1, date: '2026-01-08', concept: 'Cuota anual miembros', type: 'income', category: 'Cuotas', amount: 12000, responsible: 'Tesorera', notes: '', status: 'completed' },
    { id: 2, date: '2026-01-18', concept: 'Papelería oficina', type: 'expense', category: 'Papelería', amount: 950, responsible: 'Administración', notes: '', status: 'completed' },
    { id: 3, date: '2026-02-05', concept: 'Venta de mercancía', type: 'income', category: 'Ventas', amount: 6200, responsible: 'Tesorera', notes: '', status: 'completed' },
    { id: 4, date: '2026-02-15', concept: 'Evento bienvenida', type: 'expense', category: 'Eventos', amount: 3800, responsible: 'Coordinación', notes: '', status: 'completed' },
    { id: 5, date: '2026-03-01', concept: 'Inscripciones semestre', type: 'income', category: 'Inscripciones', amount: 25000, responsible: 'Tesorera', notes: '', status: 'completed' },
    { id: 6, date: '2026-03-12', concept: 'Servicio de diseño', type: 'expense', category: 'Servicios', amount: 2200, responsible: 'Marketing', notes: '', status: 'completed' },
    { id: 7, date: '2026-03-20', concept: 'Donación patrocinador', type: 'income', category: 'Donaciones', amount: 15000, responsible: 'Presidencia', notes: '', status: 'completed' },
    { id: 8, date: '2026-04-02', concept: 'Pago proveedores evento', type: 'expense', category: 'Eventos', amount: 5400, responsible: 'Coordinación', notes: '', status: 'completed' },
    { id: 9, date: '2026-04-04', concept: 'Venta boletos', type: 'income', category: 'Ventas', amount: 8400, responsible: 'Tesorera', notes: '', status: 'completed' },
  ],
}

function ensureDataFile() {
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(seedData, null, 2), 'utf8')
  }
}

function loadData() {
  ensureDataFile()
  const raw = readFileSync(DATA_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  return {
    movements: Array.isArray(parsed.movements) ? parsed.movements : [],
  }
}

function saveData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function parseDate(dateString) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

function moneyFormatter(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

function monthKey(dateString) {
  const date = parseDate(dateString)
  if (!date) return 'invalid'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildOverview(movements) {
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

  const sumByType = (list, type) => list.filter((item) => item.type === type).reduce((sum, item) => sum + Number(item.amount || 0), 0)
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

  const calendarEvents = sorted.slice(0, 15).map((movement) => {
    const date = parseDate(movement.date)
    return {
      id: movement.id,
      date: date ? date.getDate() : null,
      title: movement.concept,
      type: movement.type,
      time: '—',
      responsible: movement.responsible || '—',
      amount: movement.amount,
      category: movement.category,
    }
  }).filter((event) => event.date !== null)

  return {
    kpis: [
      { title: 'Balance Total', amount: totalIncome - totalExpense, trend: percentChange(currentIncome - currentExpense, (previousIncome - previousExpense)), type: 'balance' },
      { title: 'Ingresos (Mes)', amount: currentIncome, trend: percentChange(currentIncome, previousIncome), type: 'income' },
      { title: 'Egresos (Mes)', amount: currentExpense, trend: percentChange(currentExpense, previousExpense), type: 'expense' },
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
    sendJson(res, 200, { ok: true })
    return
  }

  if (req.url === '/api/overview' && req.method === 'GET') {
    const data = loadData()
    sendJson(res, 200, buildOverview(data.movements))
    return
  }

  if (req.url === '/api/movements' && req.method === 'GET') {
    const data = loadData()
    sendJson(res, 200, { movements: [...data.movements].sort((a, b) => new Date(b.date) - new Date(a.date)) })
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
        sendJson(res, 400, { error: 'La fecha no es válida' })
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

      const data = loadData()
      const newMovement = {
        id: data.movements.length ? Math.max(...data.movements.map((movement) => movement.id)) + 1 : 1,
        date: payload.date,
        concept: String(payload.concept).trim(),
        type: payload.type,
        category: String(payload.category).trim(),
        amount,
        responsible: String(payload.responsible || '').trim(),
        notes: String(payload.notes || '').trim(),
        status: 'completed',
      }

      data.movements.push(newMovement)
      saveData(data)

      sendJson(res, 201, {
        message: 'Movimiento registrado correctamente',
        movement: newMovement,
        overview: buildOverview(data.movements),
      })
    } catch (error) {
      sendJson(res, 400, { error: 'No se pudo guardar el movimiento', details: error.message })
    }
    return
  }

  sendJson(res, 404, { error: 'Ruta no encontrada' })
}).listen(PORT, () => {
  console.log(`Backend listo en http://localhost:${PORT}`)
})
