import Database from 'better-sqlite3'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DB_FILE = join(__dirname, 'saestl.db')
const LEGACY_DATA_FILE = join(__dirname, 'data.json')

const defaultMovements = [
  { date: '2026-01-08', concept: 'Cuota anual miembros', type: 'income', category: 'Cuotas', amount: 12000, responsible: 'Tesorera', notes: '', status: 'completed' },
  { date: '2026-01-18', concept: 'Papeleria oficina', type: 'expense', category: 'Papeleria', amount: 950, responsible: 'Administracion', notes: '', status: 'completed' },
  { date: '2026-02-05', concept: 'Venta de mercancia', type: 'income', category: 'Ventas', amount: 6200, responsible: 'Tesorera', notes: '', status: 'completed' },
  { date: '2026-02-15', concept: 'Evento bienvenida', type: 'expense', category: 'Eventos', amount: 3800, responsible: 'Coordinacion', notes: '', status: 'completed' },
  { date: '2026-03-01', concept: 'Inscripciones semestre', type: 'income', category: 'Inscripciones', amount: 25000, responsible: 'Tesorera', notes: '', status: 'completed' },
  { date: '2026-03-12', concept: 'Servicio de diseno', type: 'expense', category: 'Servicios', amount: 2200, responsible: 'Marketing', notes: '', status: 'completed' },
  { date: '2026-03-20', concept: 'Donacion patrocinador', type: 'income', category: 'Donaciones', amount: 15000, responsible: 'Presidencia', notes: '', status: 'completed' },
  { date: '2026-04-02', concept: 'Pago proveedores evento', type: 'expense', category: 'Eventos', amount: 5400, responsible: 'Coordinacion', notes: '', status: 'completed' },
  { date: '2026-04-04', concept: 'Venta boletos', type: 'income', category: 'Ventas', amount: 8400, responsible: 'Tesorera', notes: '', status: 'completed' },
]

const defaultEvents = [
  { date: '2026-04-18', title: 'Cierre de caja quincenal', type: 'closing', time: '18:00', location: 'Tesoreria', responsible: 'Tesorera' },
  { date: '2026-04-22', title: 'Reunion de planeacion', type: 'meeting', time: '12:00', location: 'Sala A', responsible: 'Mesa directiva' },
]

function normalizeMovement(input) {
  return {
    date: String(input.date || '').trim(),
    concept: String(input.concept || '').trim(),
    type: String(input.type || '').trim(),
    category: String(input.category || '').trim(),
    amount: Number(input.amount || 0),
    responsible: String(input.responsible || '').trim(),
    notes: String(input.notes || '').trim(),
    status: String(input.status || 'completed').trim(),
  }
}

function normalizeEvent(input) {
  return {
    date: String(input.date || '').trim(),
    title: String(input.title || '').trim(),
    type: String(input.type || 'event').trim(),
    time: String(input.time || '').trim(),
    location: String(input.location || '').trim(),
    responsible: String(input.responsible || '').trim(),
  }
}

function seedFromLegacyJson() {
  if (!existsSync(LEGACY_DATA_FILE)) {
    return {
      movements: defaultMovements,
      events: defaultEvents,
    }
  }

  try {
    const raw = readFileSync(LEGACY_DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)

    const movements = Array.isArray(parsed.movements) ? parsed.movements.map(normalizeMovement) : defaultMovements
    const events = Array.isArray(parsed.events) ? parsed.events.map(normalizeEvent) : defaultEvents

    return {
      movements: movements.length > 0 ? movements : defaultMovements,
      events,
    }
  } catch {
    return {
      movements: defaultMovements,
      events: defaultEvents,
    }
  }
}

const db = new Database(DB_FILE)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    concept TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    responsible TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('event','meeting','deadline','closing')),
    time TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    responsible TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

const movementCount = db.prepare('SELECT COUNT(*) AS total FROM movements').get().total
const eventCount = db.prepare('SELECT COUNT(*) AS total FROM events').get().total

if (movementCount === 0) {
  const seeded = seedFromLegacyJson()
  const insertMovement = db.prepare(`
    INSERT INTO movements (date, concept, type, category, amount, responsible, notes, status)
    VALUES (@date, @concept, @type, @category, @amount, @responsible, @notes, @status)
  `)

  const insertEvent = db.prepare(`
    INSERT INTO events (date, title, type, time, location, responsible)
    VALUES (@date, @title, @type, @time, @location, @responsible)
  `)

  const seedTransaction = db.transaction(() => {
    seeded.movements.forEach((movement) => insertMovement.run(normalizeMovement(movement)))
    const eventsToSeed = eventCount === 0 ? seeded.events : []
    eventsToSeed.forEach((eventItem) => insertEvent.run(normalizeEvent(eventItem)))
  })

  seedTransaction()
}

export function getMovements() {
  return db.prepare('SELECT * FROM movements ORDER BY date DESC, id DESC').all()
}

export function getEvents() {
  return db.prepare('SELECT * FROM events ORDER BY date ASC, id ASC').all()
}

export function insertMovement(movement) {
  const normalized = normalizeMovement(movement)
  const result = db.prepare(`
    INSERT INTO movements (date, concept, type, category, amount, responsible, notes, status)
    VALUES (@date, @concept, @type, @category, @amount, @responsible, @notes, @status)
  `).run(normalized)

  return db.prepare('SELECT * FROM movements WHERE id = ?').get(result.lastInsertRowid)
}

export function insertEvent(eventData) {
  const normalized = normalizeEvent(eventData)
  const result = db.prepare(`
    INSERT INTO events (date, title, type, time, location, responsible)
    VALUES (@date, @title, @type, @time, @location, @responsible)
  `).run(normalized)

  return db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid)
}
