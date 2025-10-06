// Утилиты для работы с аутентификацией

export const AUTH_TOKEN_KEY = 'access_token'

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  }

  return fetch(url, {
    ...options,
    headers
  })
}


