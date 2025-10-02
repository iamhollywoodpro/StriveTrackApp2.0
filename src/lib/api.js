const API_BASE = process.env.API_BASE || 'https://strivetrack-media-api.iamhollywoodpro.workers.dev/api'

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

export async function apiUpload(file, supabase) {
  if (!file) {
    throw new Error('No file provided')
  }
  
  // Validate file size (50MB max)
  const MAX_SIZE = 50 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    throw new Error('File size must be less than 50MB')
  }
  
  // Validate file type
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 
    'video/webm', 'video/3gpp', 'video/x-flv', 'video/mov'
  ]
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please use images (JPEG, PNG, WebP, GIF) or videos (MP4, MOV, AVI, WebM, 3GP, FLV)')
  }
  
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  
  if (!token) {
    throw new Error('Authentication required')
  }
  
  const res = await fetch(API_BASE + '/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': file.type,
      'x-file-name': file.name
    },
    body: file
  })
  
  const json = await parseJSONSafe(res)
  if (!res.ok) {
    const err = new Error(json?.error || `Upload failed (${res.status})`)
    err.response = json
    throw err
  }
  return json
}
