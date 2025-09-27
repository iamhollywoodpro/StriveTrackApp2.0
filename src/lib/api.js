const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api'

async function parseJSONSafe(res) {
  try {
    return await res.json()
  } catch (_) {
    try {
      const text = await res.text()
      return { error: text }
    } catch (_) {
      return { error: 'Unknown error' }
    }
  }
}

export async function apiGet(path, supabase) {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  const res = await fetch(API_BASE + path, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  const json = await parseJSONSafe(res)
  if (!res.ok) {
    const err = new Error(json?.error || `GET ${path} failed (${res.status})`)
    err.response = json
    throw err
  }
  return json
}

export async function apiSend(method, path, body, supabase) {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  })
  const json = await parseJSONSafe(res)
  if (!res.ok) {
    const err = new Error(json?.error || `${method} ${path} failed (${res.status})`)
    err.response = json
    throw err
  }
  return json
}
