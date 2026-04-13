const TOKEN_KEY = 'saestl_auth_token'
const USER_KEY = 'saestl_auth_user'

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}))
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAuthUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getAuthToken())
}
