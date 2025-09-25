import { Hono } from 'hono'
import { cors } from 'hono/cors'

/*
  R2 Media Proxy for StriveTrack
  - Upload:   POST /api/media/upload
  - Get URL:  POST /api/media/sign    { key }
  - Stream:   GET  /api/media/:key
  - Delete:   DELETE /api/media/:key

  Auth model:
  - Frontend sends Supabase access token: Authorization: Bearer <token>
  - We verify token by calling Supabase auth API /auth/v1/user with anon key
  - Admin: env.ADMIN_EMAIL gets full access; otherwise users can only access their own prefix `${userId}/...`
*/

// Types for env
export type Env = {
  R2: R2Bucket
  ADMIN_EMAIL?: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

async function getSupabaseUser(c: any) {
  const auth = c.req.header('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return { user: null, error: 'Missing bearer token' }

  const supabaseUrl = c.env.SUPABASE_URL
  const anon = c.env.SUPABASE_ANON_KEY
  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      authorization: `Bearer ${token}`,
      apikey: anon
    }
  })
  if (!resp.ok) return { user: null, error: `Auth check failed: ${resp.status}` }
  const user = await resp.json()
  return { user, error: null }
}

function assertPrefixAccess(userId: string, key: string) {
  // User keys must start with `${uid}/`
  const prefix = `${userId}/`
  return key.startsWith(prefix)
}

app.post('/api/media/upload', async (c) => {
  const { user, error } = await getSupabaseUser(c)
  if (error || !user?.id) return c.json({ error: 'Unauthorized' }, 401)

  const contentType = c.req.header('content-type') || 'application/octet-stream'
  const name = c.req.header('x-file-name') || 'upload.bin'
  const now = Date.now()
  const sanitized = name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${user.id}/${now}-${sanitized}`

  const body = await c.req.arrayBuffer()
  await c.env.R2.put(key, body, { httpMetadata: { contentType } })

  return c.json({ key })
})

app.post('/api/media/sign', async (c) => {
  const { user, error } = await getSupabaseUser(c)
  if (error || !user?.id) return c.json({ error: 'Unauthorized' }, 401)
  const { key } = await c.req.json().catch(() => ({}))
  if (!key) return c.json({ error: 'Missing key' }, 400)

  // Only admin or owner of prefix can sign
  const isAdmin = (user.email && c.env.ADMIN_EMAIL && user.email === c.env.ADMIN_EMAIL)
  if (!isAdmin && !assertPrefixAccess(user.id, key)) return c.json({ error: 'Forbidden' }, 403)

  // R2 doesn’t provide pre-signed URLs in Workers; we serve via streaming route instead
  const url = new URL(c.req.url)
  url.pathname = `/api/media/${key}`
  return c.json({ url: url.toString() })
})

app.get('/api/media/:key{.+}', async (c) => {
  const { user, error } = await getSupabaseUser(c)
  if (error || !user?.id) return c.json({ error: 'Unauthorized' }, 401)
  const key = c.req.param('key')

  const isAdmin = (user.email && c.env.ADMIN_EMAIL && user.email === c.env.ADMIN_EMAIL)
  if (!isAdmin && !assertPrefixAccess(user.id, key)) return c.json({ error: 'Forbidden' }, 403)

  const obj = await c.env.R2.get(key)
  if (!obj) return c.json({ error: 'Not found' }, 404)
  return new Response(obj.body, {
    headers: {
      'content-type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'cache-control': 'private, max-age=3600'
    }
  })
})

app.delete('/api/media/:key{.+}', async (c) => {
  const { user, error } = await getSupabaseUser(c)
  if (error || !user?.id) return c.json({ error: 'Unauthorized' }, 401)
  const key = c.req.param('key')

  const isAdmin = (user.email && c.env.ADMIN_EMAIL && user.email === c.env.ADMIN_EMAIL)
  if (!isAdmin && !assertPrefixAccess(user.id, key)) return c.json({ error: 'Forbidden' }, 403)

  await c.env.R2.delete(key)
  return c.json({ ok: true })
})

export default app
