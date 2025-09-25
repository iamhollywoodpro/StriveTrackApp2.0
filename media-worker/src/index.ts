import { Hono } from 'hono'

// Bindings interface
export type Bindings = {
  R2_BUCKET: R2Bucket
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
const withCORS = (resp: Response, origin: string) => {
  const headers = new Headers(resp.headers)
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-file-name')
  headers.set('Access-Control-Max-Age', '86400')
  return new Response(resp.body, { status: resp.status, headers })
}

app.options('*', (c) => {
  const origin = c.req.header('origin') || '*'
  return withCORS(new Response(null, { status: 204 }), origin)
})

// Utility: verify Supabase access token by calling /auth/v1/user
async function verifySupabaseToken(env: Bindings, token: string) {
  if (!token) return null
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_ANON_KEY }
    })
    if (!res.ok) return null
    const user = await res.json()
    return user // { id, email, ... }
  } catch (_) {
    return null
  }
}

// POST /api/upload - body is binary file; header x-file-name holds original name
app.post('/api/upload', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin)

  const headerName = c.req.header('x-file-name') || 'upload.bin'
  const sanitized = headerName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${user.id}/${Date.now()}-${sanitized}`

  const body = await c.req.arrayBuffer()
  if (!body || body.byteLength === 0)
    return withCORS(new Response(JSON.stringify({ error: 'Empty body' }), { status: 400 }), origin)

  await c.env.R2_BUCKET.put(key, body)
  return withCORS(new Response(JSON.stringify({ key }), { status: 200, headers: { 'Content-Type': 'application/json' } }), origin)
})

// GET /api/media/:key - streams file if owner or admin (admin by email match)
app.get('/api/media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  const objectKey = c.req.param('*')
  const auth = c.req.header('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin)

  const isAdmin = user.email === 'iamhollywoodpro@protonmail.com'
  const ownerPrefix = `${user.id}/`
  const isOwnerPath = objectKey.startsWith(ownerPrefix)
  if (!(isOwnerPath || isAdmin)) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin)

  const obj = await c.env.R2_BUCKET.get(objectKey)
  if (!obj) return withCORS(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }), origin)
  const headers = new Headers({ 'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream' })
  headers.set('Access-Control-Allow-Origin', origin)
  return new Response(obj.body, { headers })
})

// DELETE /api/media/:key - owner or admin
app.delete('/api/media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  const objectKey = c.req.param('*')
  const auth = c.req.header('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin)

  const isAdmin = user.email === 'iamhollywoodpro@protonmail.com'
  const ownerPrefix = `${user.id}/`
  const isOwnerPath = objectKey.startsWith(ownerPrefix)
  if (!(isOwnerPath || isAdmin)) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin)

  await c.env.R2_BUCKET.delete(objectKey)
  return withCORS(new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }), origin)
})

export default app
