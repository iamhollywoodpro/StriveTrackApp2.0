import { Hono } from 'hono'

// Bindings interface
export type Bindings = {
  R2_BUCKET: R2Bucket
  DB: D1Database
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware (echo requested headers to avoid preflight mismatches)
const withCORS = (resp: Response, origin: string, req?: Request) => {
  const headers = new Headers(resp.headers)
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Vary', 'Origin')
  headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
  const reqHeaders = req?.headers?.get('access-control-request-headers')
  headers.set('Access-Control-Allow-Headers', reqHeaders || 'authorization, content-type, x-file-name')
  headers.set('Access-Control-Max-Age', '86400')
  return new Response(resp.body, { status: resp.status, headers })
}

app.options('*', (c) => {
  const origin = c.req.header('origin') || '*'
  return withCORS(new Response(null, { status: 204 }), origin, c.req.raw)
})

// Root info route (avoid confusing 404 at /)
app.get('/', (c) => {
  const origin = c.req.header('origin') || '*'
  const body = 'StriveTrack Media API is running. Try /api/health'
  return withCORS(new Response(body, { status: 200 }), origin, c.req.raw)
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
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)

  const headerName = c.req.header('x-file-name') || 'upload.bin'
  const sanitized = headerName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${user.id}/${Date.now()}-${sanitized}`

  const body = await c.req.arrayBuffer()
  if (!body || body.byteLength === 0)
    return withCORS(new Response(JSON.stringify({ error: 'Empty body' }), { status: 400 }), origin)

  const contentType = c.req.header('content-type') || 'application/octet-stream'
  await c.env.R2_BUCKET.put(key, body, { httpMetadata: { contentType } })
  // Try to record in D1 media table if available
  try {
    // Best-effort insert; table schema assumed: media(user_id TEXT, key TEXT, content_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)
    await c.env.DB
      .prepare('INSERT INTO media (user_id, key, content_type) VALUES (?, ?, ?)')
      .bind(user.id, key, contentType)
      .run()
    // First upload achievement (+25) once
    try {
      const ach = await c.env.DB
        .prepare('INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)')
        .bind(user.id, 'first_upload', 25)
        .run()
      // @ts-ignore
      if (ach?.meta?.changes > 0) {
        await c.env.DB
          .prepare('INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)')
          .bind(user.id, 25, 'first_upload')
          .run()
      }
    } catch (_) {}
  } catch (_) {}
  return withCORS(new Response(JSON.stringify({ key }), { status: 200, headers: { 'Content-Type': 'application/json' } }), origin, c.req.raw)
})

// GET /api/media - list current user's media from D1
app.get('/api/media', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  try {
    const rs = await c.env.DB
      .prepare('SELECT key, content_type as contentType, created_at as createdAt FROM media WHERE user_id = ? ORDER BY created_at DESC')
      .bind(user.id)
      .all()
    const itemsDb = (rs.results || []).map((m: any) => ({
      key: m.key,
      contentType: m.contentType,
      createdAt: m.createdAt,
      url: `${new URL(c.req.url).origin}/api/media/${encodeURIComponent(m.key)}?token=${encodeURIComponent(token)}`
    }))
    if (itemsDb.length > 0) return jsonCORS(origin, { items: itemsDb })
    // Fallback: list from R2 if DB is empty or not yet seeded
    const list = await c.env.R2_BUCKET.list({ prefix: `${user.id}/`, limit: 1000 })
    const itemsR2 = (list.objects || []).map((o: any) => ({
      key: o.key,
      contentType: undefined,
      createdAt: (o.uploaded ? new Date(o.uploaded).toISOString() : undefined),
      url: `${new URL(c.req.url).origin}/api/media/${encodeURIComponent(o.key)}?token=${encodeURIComponent(token)}`
    }))
    return jsonCORS(origin, { items: itemsR2 })
  } catch (e: any) {
    // On error: still attempt R2 list as a last resort
    try {
      const list = await c.env.R2_BUCKET.list({ prefix: `${user.id}/`, limit: 1000 })
      const itemsR2 = (list.objects || []).map((o: any) => ({
        key: o.key,
        contentType: undefined,
        createdAt: (o.uploaded ? new Date(o.uploaded).toISOString() : undefined),
        url: `${new URL(c.req.url).origin}/api/media/${encodeURIComponent(o.key)}?token=${encodeURIComponent(token)}`
      }))
      return jsonCORS(origin, { items: itemsR2 })
    } catch (_) {
      return jsonCORS(origin, { items: [] }) // degrade gracefully if table missing
    }
  }
})

// GET /api/media/:key - streams file if owner or admin (admin by email match)
app.get('/api/media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  let objectKey = c.req.param('*')
  try { objectKey = decodeURIComponent(objectKey) } catch (_) {}
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)

  const isAdmin = user.email === 'iamhollywoodpro@protonmail.com'
  const ownerPrefix = `${user.id}/`
  const isOwnerPath = objectKey.startsWith(ownerPrefix)
  // Ownership guard with D1 fallback check
  let allowed = isOwnerPath || isAdmin
  if (!allowed) {
    try {
      const row = await c.env.DB
        .prepare('SELECT 1 as ok FROM media WHERE user_id = ? AND key = ? LIMIT 1')
        .bind(user.id, objectKey)
        .first<any>()
      if (row?.ok === 1) allowed = true
    } catch (_) {}
  }
  if (!allowed) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin)

  const obj = await c.env.R2_BUCKET.get(objectKey)
  if (!obj) return withCORS(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }), origin)
  const headers = new Headers({ 'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream' })
  headers.set('Access-Control-Allow-Origin', origin)
  return withCORS(new Response(obj.body, { headers }), origin, c.req.raw)
})

// DELETE /api/media/:key - owner or admin
app.delete('/api/media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  let objectKey = c.req.param('*')
  try { objectKey = decodeURIComponent(objectKey) } catch (_) {}
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)

  const isAdmin = user.email === 'iamhollywoodpro@protonmail.com'
  const ownerPrefix = `${user.id}/`
  const isOwnerPath = objectKey.startsWith(ownerPrefix)
  // Ownership guard with D1 fallback check
  let allowed = isOwnerPath || isAdmin
  if (!allowed) {
    try {
      const row = await c.env.DB
        .prepare('SELECT 1 as ok FROM media WHERE user_id = ? AND key = ? LIMIT 1')
        .bind(user.id, objectKey)
        .first<any>()
      if (row?.ok === 1) allowed = true
    } catch (_) {}
  }
  if (!allowed) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin)

  await c.env.R2_BUCKET.delete(objectKey)
  // Best-effort: remove index row
  try {
    await c.env.DB.prepare('DELETE FROM media WHERE user_id = ? AND key = ?').bind(user.id, objectKey).run()
  } catch (_) {}
  return withCORS(new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }), origin, c.req.raw)
})

// Small JSON helper with CORS
const jsonCORS = (origin: string, obj: any, status = 200, extra: Record<string, string> = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra }
  return withCORS(new Response(JSON.stringify(obj), { status, headers }), origin)
}

// Health check
app.get('/api/health', (c) => {
  const origin = c.req.header('origin') || '*'
  return jsonCORS(origin, { ok: true, ts: Date.now() })
})

// Goals
app.get('/api/goals', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)

  try {
    const rs = await c.env.DB
      .prepare('SELECT id, title, description, target_date, progress, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC')
      .bind(user.id)
      .all()
    return jsonCORS(origin, { items: rs.results || [] })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

app.post('/api/goals', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)

  const body = await c.req.json().catch(() => ({} as any))
  const title = (body.title || '').toString().trim()
  const description = body.description ?? null
  const target_date = body.target_date ?? null
  if (!title) return jsonCORS(origin, { error: 'Title required' }, 400)
  try {
    await c.env.DB
      .prepare('INSERT INTO goals (user_id, title, description, target_date, progress) VALUES (?, ?, ?, ?, 0)')
      .bind(user.id, title, description, target_date)
      .run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    const msg = (e?.message || '').toLowerCase()
    // Self-heal: add missing target_date column then retry once
    if (msg.includes('no column named target_date') || msg.includes('no such column: target_date')) {
      try {
        await c.env.DB.prepare('ALTER TABLE goals ADD COLUMN target_date TEXT').run()
        await c.env.DB
          .prepare('INSERT INTO goals (user_id, title, description, target_date, progress) VALUES (?, ?, ?, ?, 0)')
          .bind(user.id, title, description, target_date)
          .run()
        return jsonCORS(origin, { success: true })
      } catch (e2: any) {
        return jsonCORS(origin, { error: e2?.message || 'DB error' }, 500)
      }
    }
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

app.delete('/api/goals/:id', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const id = Number(c.req.param('id'))
  if (!id) return jsonCORS(origin, { error: 'Invalid id' }, 400)
  try {
    await c.env.DB.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').bind(id, user.id).run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// Habits
app.get('/api/habits', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  try {
    const habits = await c.env.DB
      .prepare('SELECT id, name, emoji, difficulty, days_of_week, created_at FROM habits WHERE user_id = ? ORDER BY created_at DESC')
      .bind(user.id)
      .all()

    if (from && to) {
      const logs = await c.env.DB
        .prepare('SELECT habit_id, "date" as date FROM habit_logs WHERE user_id = ? AND "date" BETWEEN ? AND ? ORDER BY "date" DESC')
        .bind(user.id, from, to)
        .all()
      return jsonCORS(origin, { items: habits.results || [], logs: logs.results || [] })
    }
    return jsonCORS(origin, { items: habits.results || [] })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

app.post('/api/habits', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)

  const body = await c.req.json().catch(() => ({} as any))
  const name = (body.name || '').toString().trim()
  if (!name) return jsonCORS(origin, { error: 'Name required' }, 400)
  const emoji = body.emoji || '💪'
  const difficulty = body.difficulty || 'Medium'
  // Store as JSON text if column is TEXT; adjust if using another type
  const days = Array.isArray(body.days_of_week) ? JSON.stringify(body.days_of_week) : JSON.stringify([0,1,2,3,4,5,6])
  try {
    await c.env.DB
      .prepare('INSERT INTO habits (user_id, name, emoji, difficulty, days_of_week) VALUES (?, ?, ?, ?, ?)')
      .bind(user.id, name, emoji, difficulty, days)
      .run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

app.post('/api/habits/:id/log', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const habitId = Number(c.req.param('id'))
  if (!habitId) return jsonCORS(origin, { error: 'Invalid habit id' }, 400)

  const body = await c.req.json().catch(() => ({} as any))
  const date = (body.date || '').toString().slice(0, 10)
  const remove = !!body.remove
  if (!date) return jsonCORS(origin, { error: 'date required (YYYY-MM-DD)' }, 400)
  try {
    if (remove) {
      await c.env.DB
        .prepare('DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ? AND "date" = ?')
        .bind(habitId, user.id, date)
        .run()
      return jsonCORS(origin, { success: true, removed: true })
    } else {
      await c.env.DB
        .prepare('INSERT INTO habit_logs (habit_id, user_id, "date") VALUES (?, ?, ?)')
        .bind(habitId, user.id, date)
        .run()
      // Award first habit log achievement
      try {
        const ach = await c.env.DB
          .prepare('INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)')
          .bind(user.id, 'first_habit_log', 10)
          .run()
        // @ts-ignore
        if (ach?.meta?.changes > 0) {
          await c.env.DB
            .prepare('INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)')
            .bind(user.id, 10, 'first_habit_log')
            .run()
        }
      } catch (_) {}
      return jsonCORS(origin, { success: true, removed: false })
    }
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

app.delete('/api/habits/:id', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const habitId = Number(c.req.param('id'))
  if (!habitId) return jsonCORS(origin, { error: 'Invalid habit id' }, 400)
  try {
    await c.env.DB.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?').bind(habitId, user.id).run()
    await c.env.DB.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').bind(habitId, user.id).run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// Nutrition
app.get('/api/nutrition', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const date = (url.searchParams.get('date') || '').slice(0, 10)
  if (!date) return jsonCORS(origin, { error: 'date required (YYYY-MM-DD)' }, 400)
  try {
    const rs = await c.env.DB
      .prepare('SELECT id, meal_name, meal_type, calories, protein, carbs, fat, "date" FROM nutrition_logs WHERE user_id = ? AND "date" = ? ORDER BY id ASC')
      .bind(user.id, date)
      .all()
    return jsonCORS(origin, { items: rs.results || [] })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

app.post('/api/nutrition', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)

  const body = await c.req.json().catch(() => ({} as any))
  const date = (body.date || '').toString().slice(0, 10)
  if (!date) return jsonCORS(origin, { error: 'date required (YYYY-MM-DD)' }, 400)
  const meal_name = (body.meal_name || '').toString()
  const meal_type = (body.meal_type || 'snacks').toString()
  const calories = Number(body.calories || 0)
  const protein = Number(body.protein || 0)
  const carbs = Number(body.carbs || 0)
  const fat = Number(body.fat || 0)
  try {
    await c.env.DB
      .prepare('INSERT INTO nutrition_logs (user_id, meal_name, meal_type, calories, protein, carbs, fat, "date") VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(user.id, meal_name, meal_type, calories, protein, carbs, fat, date)
      .run()
    // Award first nutrition entry achievement
    try {
      const ach = await c.env.DB
        .prepare('INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)')
        .bind(user.id, 'first_nutrition_entry', 10)
        .run()
      // @ts-ignore
      if (ach?.meta?.changes > 0) {
        await c.env.DB
          .prepare('INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)')
          .bind(user.id, 10, 'first_nutrition_entry')
          .run()
      }
    } catch (_) {}
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

app.delete('/api/nutrition/:id', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const id = Number(c.req.param('id'))
  if (!id) return jsonCORS(origin, { error: 'Invalid id' }, 400)
  try {
    await c.env.DB.prepare('DELETE FROM nutrition_logs WHERE id = ? AND user_id = ?').bind(id, user.id).run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// Achievements
app.get('/api/achievements', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifySupabaseToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  try {
    const itemsRs = await c.env.DB
      .prepare('SELECT id, code, points, created_at FROM achievements WHERE user_id = ? ORDER BY created_at DESC')
      .bind(user.id)
      .all()
    const pointsRs = await c.env.DB
      .prepare('SELECT COALESCE(SUM(points), 0) as total FROM points_ledger WHERE user_id = ?')
      .bind(user.id)
      .first<any>()
    const items = (itemsRs.results || []).map((a: any) => ({
      id: a.id,
      code: a.code,
      name: a.code,
      description: a.code,
      points: a.points || 0,
      created_at: a.created_at
    }))
    const total_points = (pointsRs?.total as number) ?? 0
    return jsonCORS(origin, { total_points, items })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

export default app
