const API_BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
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
