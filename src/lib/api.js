const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api'

export async function apiGet(path, supabase) {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  const res = await fetch(API_BASE + path, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  return res.json()
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
  return res.json()
}
