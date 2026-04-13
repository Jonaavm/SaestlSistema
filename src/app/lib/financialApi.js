import { clearAuthSession, getAuthToken } from './auth'

const API_BASE = '/api'

async function request(path, options = {}) {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    throw new Error(payload.error || 'No se pudo completar la solicitud')
  }

  return payload
}

export function getOverview() {
  return request('/overview')
}

export function createMovement(movement) {
  return request('/movements', {
    method: 'POST',
    body: JSON.stringify(movement),
  })
}

export function updateMovement(id, movement) {
  return request(`/movements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(movement),
  })
}

export function deleteMovement(id) {
  return request(`/movements/${id}`, {
    method: 'DELETE',
  })
}

export function getMovementAudit(id) {
  return request(`/movements/${id}/audit`)
}

export function createEvent(eventData) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  })
}

export function getNotifications() {
  return request('/notifications')
}

export function markNotificationRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, {
    method: 'POST',
  })
}

export function markAllNotificationsRead() {
  return request('/notifications/read-all', {
    method: 'POST',
  })
}

export function createBackup() {
  return request('/backups', {
    method: 'POST',
  })
}

export function listBackups() {
  return request('/backups')
}
