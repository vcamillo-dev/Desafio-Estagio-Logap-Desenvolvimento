import { supabase } from '../supabaseClient.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export async function apiRequest(path, options = {}) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  const requestUrl = apiBaseUrl ? new URL(path, apiBaseUrl).toString() : path
  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(session?.access_token ? { Authorization: 'Bearer ' + session.access_token } : {}),
      ...options.headers,
    },
  })

  const text = await response.text()
  let result = null

  if (text) {
    try {
      result = JSON.parse(text)
    } catch {
      result = text
    }
  }

  if (response.status === 401) {
    await supabase.auth.signOut()
    throw new Error('Sua sessão expirou. Entre novamente.')
  }

  if (!response.ok) {
    throw new Error(result?.detail || result?.message || result || 'Não foi possível concluir a solicitação.')
  }

  return result
}
