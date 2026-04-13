import Database from 'better-sqlite3'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DB_FILE = join(__dirname, 'saestl.db')
const BACKUP_DIR = join(__dirname, 'backups')
const LEGACY_DATA_FILE = join(__dirname, 'data.json')
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

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

function createPasswordHash(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || '').split(':')
  if (!salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  const candidate = scryptSync(password, salt, 64)
  if (candidate.length !== expected.length) return false

  return timingSafeEqual(candidate, expected)
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

if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true })
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','tesoreria','consulta')),
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

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

  CREATE TABLE IF NOT EXISTS movement_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('create','update','delete')),
    before_data TEXT,
    after_data TEXT,
    changed_by_user_id INTEGER,
    changed_by_username TEXT,
    created_at INTEGER NOT NULL
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

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    role_target TEXT NOT NULL CHECK(role_target IN ('all','admin','tesoreria','consulta')),
    metadata TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notification_reads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    read_at INTEGER NOT NULL,
    UNIQUE(notification_id, user_id)
  );
`)

function ensureUser(username, password, role) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) return existing

  const result = db.prepare(
    'INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, ?, ?)'
  ).run(username, createPasswordHash(password), role, Date.now())

  return { id: result.lastInsertRowid }
}

const movementCount = db.prepare('SELECT COUNT(*) AS total FROM movements').get().total
const eventCount = db.prepare('SELECT COUNT(*) AS total FROM events').get().total

ensureUser('admin', 'admin123', 'admin')
ensureUser('tesoreria', 'teso123', 'tesoreria')
ensureUser('consulta', 'consulta123', 'consulta')
ensureUser('gustavo', '12345', 'admin')
ensureUser('jonathan', '12345', 'tesoreria')
ensureUser('luis', '12345', 'consulta')

if (movementCount === 0) {
  const seeded = seedFromLegacyJson()
  const insertMovementStatement = db.prepare(`
    INSERT INTO movements (date, concept, type, category, amount, responsible, notes, status)
    VALUES (@date, @concept, @type, @category, @amount, @responsible, @notes, @status)
  `)

  const insertEventStatement = db.prepare(`
    INSERT INTO events (date, title, type, time, location, responsible)
    VALUES (@date, @title, @type, @time, @location, @responsible)
  `)

  const seedTransaction = db.transaction(() => {
    seeded.movements.forEach((movement) => insertMovementStatement.run(normalizeMovement(movement)))
    const eventsToSeed = eventCount === 0 ? seeded.events : []
    eventsToSeed.forEach((eventItem) => insertEventStatement.run(normalizeEvent(eventItem)))
  })

  seedTransaction()
}

function createNotification(type, title, message, roleTarget = 'all', metadata = null) {
  db.prepare(`
    INSERT INTO notifications (type, title, message, role_target, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(type, title, message, roleTarget, metadata ? JSON.stringify(metadata) : null, Date.now())
}

function logMovementAudit(movementId, action, beforeData, afterData, actor) {
  db.prepare(`
    INSERT INTO movement_audit (movement_id, action, before_data, after_data, changed_by_user_id, changed_by_username, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    movementId,
    action,
    beforeData ? JSON.stringify(beforeData) : null,
    afterData ? JSON.stringify(afterData) : null,
    actor?.id || null,
    actor?.username || 'sistema',
    Date.now()
  )
}

export function authenticateUser(username, password) {
  const user = db.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?').get(String(username || '').trim())
  if (!user) return null
  if (!verifyPassword(String(password || ''), user.password_hash)) return null

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  }
}

export function createSession(userId) {
  const token = randomBytes(32).toString('hex')
  const now = Date.now()
  const expiresAt = now + SESSION_TTL_MS

  db.prepare('INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    userId,
    token,
    expiresAt,
    now
  )

  return {
    token,
    expiresAt,
  }
}

export function getSessionByToken(token) {
  if (!token) return null

  const session = db.prepare(`
    SELECT s.token, s.expires_at, u.id AS user_id, u.username, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
  `).get(token)

  if (!session) return null
  if (session.expires_at <= Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
    return null
  }

  return {
    token: session.token,
    expiresAt: session.expires_at,
    user: {
      id: session.user_id,
      username: session.username,
      role: session.role,
    },
  }
}

export function deleteSession(token) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

export function cleanupExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now())
}

export function getMovements() {
  return db.prepare('SELECT * FROM movements ORDER BY date DESC, id DESC').all()
}

export function getMovementById(id) {
  return db.prepare('SELECT * FROM movements WHERE id = ?').get(id)
}

export function insertMovement(movement, actor) {
  const normalized = normalizeMovement(movement)
  const result = db.prepare(`
    INSERT INTO movements (date, concept, type, category, amount, responsible, notes, status)
    VALUES (@date, @concept, @type, @category, @amount, @responsible, @notes, @status)
  `).run(normalized)

  const inserted = getMovementById(result.lastInsertRowid)
  logMovementAudit(inserted.id, 'create', null, inserted, actor)
  createNotification('movement', 'Nuevo movimiento', `${actor.username} registro: ${inserted.concept}`, 'all', {
    movementId: inserted.id,
    action: 'create',
  })

  return inserted
}

export function updateMovement(id, updates, actor) {
  const previous = getMovementById(id)
  if (!previous) return null

  const merged = {
    ...previous,
    ...updates,
  }

  const normalized = normalizeMovement(merged)
  db.prepare(`
    UPDATE movements
    SET date = @date,
        concept = @concept,
        type = @type,
        category = @category,
        amount = @amount,
        responsible = @responsible,
        notes = @notes,
        status = @status
    WHERE id = @id
  `).run({ ...normalized, id })

  const updated = getMovementById(id)
  logMovementAudit(id, 'update', previous, updated, actor)
  createNotification('movement', 'Movimiento actualizado', `${actor.username} actualizo: ${updated.concept}`, 'all', {
    movementId: updated.id,
    action: 'update',
  })

  return updated
}

export function removeMovement(id, actor) {
  const existing = getMovementById(id)
  if (!existing) return false

  db.prepare('DELETE FROM movements WHERE id = ?').run(id)
  logMovementAudit(id, 'delete', existing, null, actor)
  createNotification('movement', 'Movimiento eliminado', `${actor.username} elimino: ${existing.concept}`, 'admin', {
    movementId: id,
    action: 'delete',
  })

  return true
}

export function getMovementAudit(movementId) {
  return db.prepare(`
    SELECT id, movement_id, action, before_data, after_data, changed_by_user_id, changed_by_username, created_at
    FROM movement_audit
    WHERE movement_id = ?
    ORDER BY id DESC
  `).all(movementId).map((row) => ({
    ...row,
    before_data: row.before_data ? JSON.parse(row.before_data) : null,
    after_data: row.after_data ? JSON.parse(row.after_data) : null,
  }))
}

export function getEvents() {
  return db.prepare('SELECT * FROM events ORDER BY date ASC, id ASC').all()
}

export function insertEvent(eventData, actor) {
  const normalized = normalizeEvent(eventData)
  const result = db.prepare(`
    INSERT INTO events (date, title, type, time, location, responsible)
    VALUES (@date, @title, @type, @time, @location, @responsible)
  `).run(normalized)

  const inserted = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid)
  createNotification('calendar', 'Nuevo evento', `${actor.username} agrego: ${inserted.title}`, 'all', {
    eventId: inserted.id,
  })

  return inserted
}

export function getNotificationsForUser(user, limit = 30) {
  return db.prepare(`
    SELECT n.id, n.type, n.title, n.message, n.role_target, n.metadata, n.created_at,
           CASE WHEN nr.id IS NULL THEN 0 ELSE 1 END AS is_read
    FROM notifications n
    LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
    WHERE n.role_target IN ('all', ?)
    ORDER BY n.created_at DESC
    LIMIT ?
  `).all(user.id, user.role, limit).map((row) => ({
    ...row,
    is_read: Boolean(row.is_read),
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  }))
}

export function markNotificationAsRead(notificationId, userId) {
  db.prepare(`
    INSERT OR IGNORE INTO notification_reads (notification_id, user_id, read_at)
    VALUES (?, ?, ?)
  `).run(notificationId, userId, Date.now())
}

export function markAllNotificationsAsRead(userId, role) {
  const notificationIds = db.prepare(`
    SELECT id FROM notifications WHERE role_target IN ('all', ?)
  `).all(role)

  const insertRead = db.prepare(`
    INSERT OR IGNORE INTO notification_reads (notification_id, user_id, read_at)
    VALUES (?, ?, ?)
  `)

  const transaction = db.transaction(() => {
    const readAt = Date.now()
    notificationIds.forEach((item) => {
      insertRead.run(item.id, userId, readAt)
    })
  })

  transaction()
}

export function createDatabaseBackup(actor) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
  const filename = `saestl-backup-${timestamp}.db`
  const fullPath = join(BACKUP_DIR, filename)
  const safePath = fullPath.replace(/'/g, "''")

  db.exec(`VACUUM INTO '${safePath}'`)

  createNotification('backup', 'Respaldo generado', `${actor.username} genero respaldo ${filename}`, 'admin', {
    filename,
  })

  return {
    filename,
    path: fullPath,
    createdAt: Date.now(),
  }
}

export function listDatabaseBackups() {
  if (!existsSync(BACKUP_DIR)) return []

  const names = readdirSync(BACKUP_DIR)
  return names
    .filter((name) => name.endsWith('.db'))
    .map((name) => {
      const full = join(BACKUP_DIR, name)
      const stat = statSync(full)
      return {
        filename: name,
        sizeBytes: stat.size,
        createdAt: stat.mtimeMs,
      }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
}
