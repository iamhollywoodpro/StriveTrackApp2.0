import { Hono } from 'hono'

// Bindings interface
export type Bindings = {
  R2_BUCKET: R2Bucket
  DB: D1Database
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

// Admin email list
const ADMIN_EMAILS = ['iamhollywoodpro@protonmail.com', 'iamhollywoodpro@gmail.com']

const app = new Hono<{ Bindings: Bindings }>()

// --- Helpers ---
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

const jsonCORS = (origin: string, obj: any, status = 200, extra: Record<string, string> = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra }
  return withCORS(new Response(JSON.stringify(obj), { status, headers }), origin)
}

function guessContentTypeFromKey(key: string): string | undefined {
  const k = key.toLowerCase()
  if (k.endsWith('.jpg') || k.endsWith('.jpeg')) return 'image/jpeg'
  if (k.endsWith('.png')) return 'image/png'
  if (k.endsWith('.webp')) return 'image/webp'
  if (k.endsWith('.gif')) return 'image/gif'
  if (k.endsWith('.mp4')) return 'video/mp4'
  if (k.endsWith('.mov') || k.endsWith('.qt')) return 'video/quicktime'
  if (k.endsWith('.webm')) return 'video/webm'
  if (k.endsWith('.avi')) return 'video/x-msvideo'
  if (k.endsWith('.3gp') || k.endsWith('.3gpp')) return 'video/3gpp'
  if (k.endsWith('.flv')) return 'video/x-flv'
  return undefined
}

async function ensureTables(env: Bindings) {
  // Create base tables first
  const createStmts = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );`,
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`,
    `CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      r2_key TEXT NOT NULL,
      content_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, r2_key)
    );`,
    `CREATE TABLE IF NOT EXISTS nutrition_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      meal_name TEXT,
      meal_type TEXT,
      calories INTEGER,
      protein INTEGER,
      carbs INTEGER,
      fat INTEGER,
      "date" TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      points INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, code)
    );`,
    `CREATE TABLE IF NOT EXISTS points_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      points INTEGER NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT,
      difficulty TEXT,
      days_of_week TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      "date" TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      name TEXT,
      bio TEXT,
      targets TEXT,
      profile_picture TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_date TEXT,
      progress INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS social_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      post_type TEXT DEFAULT 'progress',
      visibility TEXT DEFAULT 'public',
      media_url TEXT,
      tags TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS social_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES social_posts(id)
    );`,
    `CREATE TABLE IF NOT EXISTS social_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES social_posts(id)
    );`,
    `CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id TEXT NOT NULL,
      addressee_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(requester_id, addressee_id)
    );`,
    `CREATE TABLE IF NOT EXISTS friend_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenger_id TEXT NOT NULL,
      challenged_id TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_value INTEGER,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'active',
      winner_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS user_stats (
      user_id TEXT PRIMARY KEY,
      total_points INTEGER DEFAULT 0,
      posts_count INTEGER DEFAULT 0,
      total_friends INTEGER DEFAULT 0,
      total_likes_received INTEGER DEFAULT 0,
      challenges_won INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  ]

  // Execute base table creation
  for (const sql of createStmts) {
    try { await env.DB.prepare(sql).run() } catch (_) {}
  }

  // Add new columns to existing tables (safe to run multiple times)
  const alterStmts = [
    `ALTER TABLE nutrition_logs ADD COLUMN fiber INTEGER DEFAULT 0`,
    `ALTER TABLE nutrition_logs ADD COLUMN sugar INTEGER DEFAULT 0`, 
    `ALTER TABLE nutrition_logs ADD COLUMN serving_size TEXT DEFAULT '1 serving'`,
    `ALTER TABLE nutrition_logs ADD COLUMN food_image TEXT`,
    `ALTER TABLE nutrition_logs ADD COLUMN food_id TEXT`,
    `ALTER TABLE nutrition_logs ADD COLUMN category TEXT`,
    `ALTER TABLE nutrition_logs ADD COLUMN addons TEXT`,
    `ALTER TABLE social_posts ADD COLUMN visibility TEXT DEFAULT 'public'`,
    `ALTER TABLE social_posts ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE media ADD COLUMN flagged INTEGER DEFAULT 0`,
    `ALTER TABLE media ADD COLUMN flag_reason TEXT`,
    `ALTER TABLE media ADD COLUMN flagged_at DATETIME`,
    `ALTER TABLE media ADD COLUMN flagged_by TEXT`,
    `ALTER TABLE media ADD COLUMN metadata TEXT`,
    `ALTER TABLE media ADD COLUMN progress_type TEXT DEFAULT 'progress'`,
    `ALTER TABLE media ADD COLUMN description TEXT`,
    `ALTER TABLE media ADD COLUMN privacy_level TEXT DEFAULT 'private'`
  ]

  // Execute ALTER statements (ignore errors if columns already exist)
  for (const sql of alterStmts) {
    try { await env.DB.prepare(sql).run() } catch (_) {
      // Column already exists or other error - ignore
    }
  }
}

// Achievement granting helper function
async function grantAchievement(env: Bindings, userId: string, achievementCode: string, points: number, reason?: string) {
  try {
    // Check if achievement already earned today (for daily achievements)
    if (achievementCode.startsWith('daily_')) {
      const today = new Date().toISOString().split('T')[0];
      const existing = await env.DB.prepare('SELECT id FROM achievements WHERE user_id = ? AND code = ? AND DATE(created_at) = ?')
        .bind(userId, achievementCode, today)
        .first();
      
      if (existing) {
        console.log(`Achievement ${achievementCode} already earned today for user ${userId}`);
        return false; // Already earned today
      }
    } else {
      // For non-daily achievements, check if ever earned
      const existing = await env.DB.prepare('SELECT id FROM achievements WHERE user_id = ? AND code = ?')
        .bind(userId, achievementCode)
        .first();
      
      if (existing) {
        console.log(`Achievement ${achievementCode} already earned for user ${userId}`);
        return false; // Already earned
      }
    }

    // Grant the achievement
    await env.DB.prepare('INSERT INTO achievements (user_id, code, points) VALUES (?, ?, ?)')
      .bind(userId, achievementCode, points)
      .run();

    // Add points to ledger
    await env.DB.prepare('INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)')
      .bind(userId, points, reason || achievementCode)
      .run();

    console.log(`✅ Achievement granted: ${achievementCode} (+${points} points) to user ${userId}`);
    return true; // Successfully granted
  } catch (error) {
    console.error('Error granting achievement:', error);
    return false;
  }
}

// Simple JWT verification using Cloudflare secrets
async function verifyJWTToken(env: Bindings, token: string) {
  if (!token) return null
  
  try {
    // For now, implement simple token validation
    // Later we'll use proper JWT with Cloudflare Workers
    
    // Simple session-based auth - store sessions in D1
    const session = await env.DB.prepare('SELECT user_id, email, created_at FROM user_sessions WHERE token = ? AND expires_at > ?')
      .bind(token, Date.now())
      .first<{ user_id: string, email: string, created_at: number }>()
    
    if (!session) return null
    
    return {
      id: session.user_id,
      email: session.email,
      session_created: session.created_at
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Fallback: also try Supabase for existing users during transition
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

// Unified token verification - try both methods
async function verifyToken(env: Bindings, token: string) {
  // Try Cloudflare auth first
  let user = await verifyJWTToken(env, token)
  
  // Fallback to Supabase for transition period
  if (!user) {
    user = await verifySupabaseToken(env, token)
  }
  
  return user
}

app.options('*', (c) => {
  const origin = c.req.header('origin') || '*'
  return withCORS(new Response(null, { status: 204 }), origin, c.req.raw)
})

// Root info route
app.get('/', (c) => {
  const origin = c.req.header('origin') || '*'
  const body = 'StriveTrack Media API is running. Try /api/health'
  return withCORS(new Response(body, { status: 200 }), origin, c.req.raw)
})

// Health check
app.get('/api/health', (c) => {
  const origin = c.req.header('origin') || '*'
  return jsonCORS(origin, { ok: true, ts: Date.now() })
})

// System test endpoint - NO AUTH REQUIRED (for debugging)
app.get('/api/system-test', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {} as any
  }
  
  try {
    // Test 1: Environment variables
    results.tests.env = {
      supabase_url: !!c.env.SUPABASE_URL,
      supabase_anon_key: !!c.env.SUPABASE_ANON_KEY,
      r2_bucket: !!c.env.R2_BUCKET,
      d1_db: !!c.env.DB
    }
    
    // Test 2: Database connectivity
    try {
      await ensureTables(c.env)
      await c.env.DB.prepare('SELECT 1 as test').first()
      results.tests.database = { status: 'ok', error: null }
    } catch (error: any) {
      results.tests.database = { status: 'error', error: error.message }
    }
    
    // Test 3: R2 connectivity
    try {
      const testKey = `system-test-${Date.now()}.txt`
      await c.env.R2_BUCKET.put(testKey, 'test content')
      const retrieved = await c.env.R2_BUCKET.get(testKey)
      if (retrieved) {
        await c.env.R2_BUCKET.delete(testKey)
        results.tests.r2_storage = { status: 'ok', error: null }
      } else {
        results.tests.r2_storage = { status: 'error', error: 'Could not retrieve test file' }
      }
    } catch (error: any) {
      results.tests.r2_storage = { status: 'error', error: error.message }
    }
    
    // Test 4: Supabase connectivity (without user token)
    try {
      const response = await fetch(`${c.env.SUPABASE_URL}/rest/v1/`, {
        headers: { 'apikey': c.env.SUPABASE_ANON_KEY }
      })
      results.tests.supabase_connectivity = { 
        status: response.ok ? 'ok' : 'error', 
        error: response.ok ? null : `HTTP ${response.status}`,
        response_status: response.status
      }
    } catch (error: any) {
      results.tests.supabase_connectivity = { status: 'error', error: error.message }
    }
    
    results.overall_status = Object.values(results.tests).every((test: any) => test.status === 'ok') ? 'healthy' : 'degraded'
    
  } catch (error: any) {
    results.tests.system = { status: 'error', error: error.message }
    results.overall_status = 'failed'
  }
  
  return jsonCORS(origin, results)
})

// TEMPORARY TEST UPLOAD - NO AUTH (for debugging upload failures)
app.post('/api/test-upload', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    console.log('🧪 TEST UPLOAD: Starting...')
    
    await ensureTables(c.env)
    
    // Use a test user ID
    const testUserId = 'test-user-' + Date.now()
    const headerName = c.req.header('x-file-name') || 'test-upload.bin'
    const sanitized = headerName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `${testUserId}/progress/test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${sanitized.split('.').pop()}`
    
    console.log('🧪 TEST UPLOAD: Processing file...')
    
    const body = await c.req.arrayBuffer()
    if (!body || body.byteLength === 0) {
      console.log('❌ TEST UPLOAD: Empty file')
      return jsonCORS(origin, { error: 'No file content' }, 400)
    }
    
    console.log(`🧪 TEST UPLOAD: File size: ${body.byteLength} bytes`)
    
    // Upload to R2
    console.log('🧪 TEST UPLOAD: Uploading to R2...')
    const r2Result = await c.env.R2_BUCKET.put(key, body, {
      httpMetadata: {
        contentType: c.req.header('content-type') || 'application/octet-stream',
        contentLength: body.byteLength.toString()
      }
    })
    
    if (!r2Result) {
      console.log('❌ TEST UPLOAD: R2 upload failed')
      return jsonCORS(origin, { error: 'R2 upload failed' }, 500)
    }
    
    console.log('✅ TEST UPLOAD: R2 upload successful')
    
    // Store in D1
    console.log('🧪 TEST UPLOAD: Storing in database...')
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO media (user_id, r2_key, content_type, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(testUserId, key, c.req.header('content-type') || 'application/octet-stream', Date.now()).run()
    
    console.log('✅ TEST UPLOAD: Database storage successful')
    
    return jsonCORS(origin, {
      success: true,
      key,
      testUserId,
      message: 'Test upload successful - NO AUTH CHECK',
      size: body.byteLength,
      url: `https://strivetrack-media-api.iamhollywoodpro.workers.dev/api/test-media/${encodeURIComponent(key)}`
    })
    
  } catch (error: any) {
    console.error('💥 TEST UPLOAD ERROR:', error)
    return jsonCORS(origin, { 
      error: `Test upload failed: ${error.message}`,
      stack: error.stack 
    }, 500)
  }
})

// Get test uploaded media - NO AUTH
app.get('/api/test-media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  const fullPath = c.req.path
  let objectKey = fullPath.replace('/api/test-media/', '')
  try { 
    objectKey = decodeURIComponent(objectKey) 
  } catch (_) {}
  
  console.log(`🧪 TEST MEDIA: Retrieving ${objectKey}`)
  
  const obj = await c.env.R2_BUCKET.get(objectKey)
  if (!obj) {
    console.log(`❌ TEST MEDIA: File not found ${objectKey}`)
    return withCORS(new Response('File not found', { status: 404 }), origin, c.req.raw)
  }
  
  console.log(`✅ TEST MEDIA: File found, serving ${objectKey}`)
  
  const headers: Record<string, string> = {}
  if (obj.httpMetadata?.contentType) {
    headers['Content-Type'] = obj.httpMetadata.contentType
  }
  if (obj.size) {
    headers['Content-Length'] = obj.size.toString()
  }
  
  return withCORS(new Response(obj.body, { headers }), origin, c.req.raw)
})

// ---------------- Authentication ----------------
// Simple password hashing (for demo - use bcrypt in production)
function simpleHash(password: string): string {
  // This is a simple hash - in production use proper bcrypt
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'strivetrack-salt-2024')
  return Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

// Generate session token
function generateSessionToken(): string {
  return `st_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`
}

// POST /api/auth/register
app.post('/api/auth/register', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    await ensureTables(c.env)
    
    const { email, password, name } = await c.req.json()
    
    if (!email || !password) {
      return jsonCORS(origin, { error: 'Email and password required' }, 400)
    }
    
    if (password.length < 6) {
      return jsonCORS(origin, { error: 'Password must be at least 6 characters' }, 400)
    }
    
    // Check if user exists
    const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first()
    
    if (existingUser) {
      return jsonCORS(origin, { error: 'User already exists' }, 409)
    }
    
    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    const passwordHash = simpleHash(password)
    
    await c.env.DB.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)')
      .bind(userId, email.toLowerCase(), passwordHash, name || email.split('@')[0])
      .run()
    
    // Create session
    const token = generateSessionToken()
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    
    await c.env.DB.prepare('INSERT INTO user_sessions (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)')
      .bind(userId, email.toLowerCase(), token, expiresAt)
      .run()
    
    return jsonCORS(origin, {
      success: true,
      user: { id: userId, email: email.toLowerCase(), name: name || email.split('@')[0] },
      token,
      expires_at: expiresAt
    })
    
  } catch (error: any) {
    console.error('Registration error:', error)
    return jsonCORS(origin, { error: 'Registration failed' }, 500)
  }
})

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    await ensureTables(c.env)
    
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return jsonCORS(origin, { error: 'Email and password required' }, 400)
    }
    
    // Find user
    const user = await c.env.DB.prepare('SELECT id, email, password_hash, name FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first<{ id: string, email: string, password_hash: string, name: string }>()
    
    if (!user) {
      return jsonCORS(origin, { error: 'Invalid credentials' }, 401)
    }
    
    // Verify password
    const passwordHash = simpleHash(password)
    if (passwordHash !== user.password_hash) {
      return jsonCORS(origin, { error: 'Invalid credentials' }, 401)
    }
    
    // Create session
    const token = generateSessionToken()
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    
    // Clean old sessions (keep last 5)
    await c.env.DB.prepare('DELETE FROM user_sessions WHERE user_id = ? AND id NOT IN (SELECT id FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5)')
      .bind(user.id, user.id)
      .run()
    
    await c.env.DB.prepare('INSERT INTO user_sessions (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)')
      .bind(user.id, user.email, token, expiresAt)
      .run()
    
    // Grant daily login achievement (5 points)
    await grantAchievement(c.env, user.id, 'daily_login', 5, 'Daily Check-in')
    
    return jsonCORS(origin, {
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token,
      expires_at: expiresAt
    })
    
  } catch (error: any) {
    console.error('Login error:', error)
    return jsonCORS(origin, { error: 'Login failed' }, 500)
  }
})

// POST /api/auth/logout
app.post('/api/auth/logout', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    const auth = c.req.header('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    
    if (token) {
      await c.env.DB.prepare('DELETE FROM user_sessions WHERE token = ?')
        .bind(token)
        .run()
    }
    
    return jsonCORS(origin, { success: true, message: 'Logged out' })
    
  } catch (error: any) {
    console.error('Logout error:', error)
    return jsonCORS(origin, { error: 'Logout failed' }, 500)
  }
})

// GET /api/auth/me
app.get('/api/auth/me', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    const auth = c.req.header('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    
    const user = await verifyToken(c.env, token)
    if (!user?.id) {
      return jsonCORS(origin, { error: 'Not authenticated' }, 401)
    }
    
    return jsonCORS(origin, {
      user: { id: user.id, email: user.email, name: user.name || user.email?.split('@')[0] }
    })
    
  } catch (error: any) {
    console.error('Auth check error:', error)
    return jsonCORS(origin, { error: 'Authentication check failed' }, 500)
  }
})

// ---------------- Media ----------------
// POST /api/upload (Legacy endpoint for backward compatibility)
app.post('/api/upload', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)

  await ensureTables(c.env)

  const userId = user.id
  const headerName = c.req.header('x-file-name') || 'upload.bin'
  const sanitized = headerName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${userId}/progress/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${sanitized.split('.').pop()}`

  const body = await c.req.arrayBuffer()
  if (!body || body.byteLength === 0)
    return withCORS(new Response(JSON.stringify({ error: 'Empty body' }), { status: 400 }), origin)

  const contentType = c.req.header('content-type') || guessContentTypeFromKey(key) || 'application/octet-stream'
  
  // R2 upload with verification
  const r2Result = await c.env.R2_BUCKET.put(key, body, { httpMetadata: { contentType } })
  if (!r2Result) {
    throw new Error('Failed to upload file to R2 storage')
  }

  // Only index in D1 after successful R2 upload
  await c.env.DB.prepare('INSERT INTO media (user_id, r2_key, content_type, progress_type, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(userId, key, contentType, 'progress', Date.now())
    .run()
    
  // First upload achievement (+25) - use proper achievement system
  const achievements = []
  try {
    const firstUploadResult = await grantAchievement(c.env, userId, 'first_upload', 25, 'First Progress Upload!')
    if (firstUploadResult) {
      achievements.push({
        code: 'first_upload',
        title: 'First Progress Upload!',
        description: 'You uploaded your first progress photo!',
        points: 25,
        category: 'progress'
      })
    }
  } catch (achErr) {
    console.log('Achievement error:', achErr)
  }

  // Progress photo achievement (+10) for any progress upload
  try {
    const progressResult = await grantAchievement(c.env, userId, 'daily_progress_photo', 10, 'Daily Progress Hero')
    if (progressResult) {
      achievements.push({
        code: 'daily_progress_photo',
        title: 'Daily Progress Hero',
        description: 'You captured your progress today!',
        points: 10,
        category: 'progress'
      })
    }
  } catch (achErr) {
    console.log('Daily progress achievement error:', achErr)
  }

  return withCORS(new Response(JSON.stringify({ 
    key, 
    success: true,
    achievements: achievements.length > 0 ? achievements : undefined
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }), origin, c.req.raw)
})

// POST /api/upload/presigned - Generate presigned URL for direct R2 upload
app.post('/api/upload/presigned', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { fileName, fileType, fileSize, fileKey } = body
    
    if (!fileName || !fileType || !fileKey) {
      return jsonCORS(origin, { error: 'Missing required fields: fileName, fileType, fileKey' }, 400)
    }

    // Generate presigned POST URL for R2
    const presignedUrl = `https://${c.env.R2_BUCKET.accountId}.r2.cloudflarestorage.com/${c.env.R2_BUCKET.name}`
    
    // For Cloudflare R2, we'll use the direct upload endpoint instead
    // Since R2 doesn't support presigned POST like S3, we'll return a simplified response
    return jsonCORS(origin, {
      url: presignedUrl,
      fields: {
        key: fileKey,
        'Content-Type': fileType
      },
      key: fileKey
    })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'Failed to generate presigned URL' }, 500)
  }
})

// POST /api/upload/worker - Worker proxy upload (multipart form data)
app.post('/api/upload/worker', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    console.log('📁 Worker upload started')
    
    const auth = c.req.header('authorization') || ''
    const url = new URL(c.req.url)
    const qToken = url.searchParams.get('token') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
    
    console.log('🔐 Token validation...')
    const user = await verifyToken(c.env, token)
    if (!user?.id) {
      console.log('❌ Authentication failed')
      return jsonCORS(origin, { error: 'Unauthorized' }, 401)
    }
    
    const userId = user.id
    console.log('✅ User authenticated:', userId)
    await ensureTables(c.env)

    console.log('📄 Processing form data...')
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string || file?.name || 'upload.bin'
    const fileType = formData.get('fileType') as string || file?.type || 'application/octet-stream'

    if (!file) {
      console.log('❌ No file provided')
      return jsonCORS(origin, { error: 'No file provided' }, 400)
    }
    
    console.log('📊 File info:', { name: fileName, type: fileType, size: file.size })

    // Generate unique file key
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = fileName.split('.').pop()
    const key = `${userId}/progress/${timestamp}-${randomId}.${fileExtension}`
    
    console.log('🗝️ Generated key:', key)

    // Upload to R2
    console.log('☁️ Uploading to R2...')
    const buffer = await file.arrayBuffer()
    
    // R2 upload with error handling
    const r2Result = await c.env.R2_BUCKET.put(key, buffer, { 
      httpMetadata: { 
        contentType: fileType,
        contentLength: buffer.byteLength.toString()
      } 
    })
    
    if (!r2Result) {
      console.error('❌ R2 upload failed - no result returned')
      throw new Error('Failed to upload file to R2 storage')
    }
    
    console.log('✅ R2 upload complete', { etag: r2Result.etag })

    // Only index in D1 AFTER successful R2 upload
    console.log('🗃️ Indexing in D1...')
    await c.env.DB.prepare('INSERT OR REPLACE INTO media (user_id, r2_key, content_type, created_at) VALUES (?, ?, ?, ?)')
      .bind(userId, key, fileType, Date.now())
      .run()
    
    // First upload achievement
    try {
      const ach = await c.env.DB.prepare('INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)')
        .bind(userId, 'first_upload', 25).run()
      // @ts-ignore
      if (ach?.meta?.changes > 0) {
        await c.env.DB.prepare('INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)')
          .bind(userId, 25, 'first_upload').run()
      }
    } catch (achErr) {
      console.log('Achievement already earned or error:', achErr)
    }
    console.log('✅ D1 indexing complete')

    console.log('🎉 Upload successful!', { key })
    return jsonCORS(origin, { key, success: true })
  } catch (e: any) {
    console.error('❌ Worker upload error:', e.message)
    console.error('Stack:', e.stack)
    return jsonCORS(origin, { error: e?.message || 'Worker upload failed' }, 500)
  }
})

// POST /api/upload/chunked - Chunked upload for large files
app.post('/api/upload/chunked', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const formData = await c.req.formData()
    const chunk = formData.get('chunk') as File
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    const uploadId = formData.get('uploadId') as string
    const fileName = formData.get('fileName') as string
    const fileType = formData.get('fileType') as string

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId) {
      return jsonCORS(origin, { error: 'Missing required chunk data' }, 400)
    }

    // Store chunk temporarily (for now, just return success)
    // In a real implementation, you'd store chunks in R2 with temporary keys
    // and assemble them in the finalize endpoint
    
    return jsonCORS(origin, { 
      success: true, 
      chunkIndex, 
      totalChunks, 
      uploadId,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} received`
    })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'Chunked upload failed' }, 500)
  }
})

// POST /api/upload/chunked/finalize - Finalize chunked upload
app.post('/api/upload/chunked/finalize', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { uploadId, fileName, fileType, totalSize, chunks } = body

    if (!uploadId || !fileName || !fileType) {
      return jsonCORS(origin, { error: 'Missing required finalization data' }, 400)
    }

    // For now, since chunked upload is complex to implement properly in R2,
    // we'll fall back to the worker upload method
    return jsonCORS(origin, { error: 'Chunked upload not fully implemented, use worker upload instead' }, 501)
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'Chunked finalization failed' }, 500)
  }
})

// POST /api/upload/base64 - Base64 upload (last resort)
app.post('/api/upload/base64', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { fileName, fileType, fileSize, data } = body

    if (!fileName || !fileType || !data) {
      return jsonCORS(origin, { error: 'Missing required fields: fileName, fileType, data' }, 400)
    }

    // Parse base64 data
    const base64Data = data.split(',')[1] || data // Remove data:image/jpeg;base64, prefix if present
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    // Generate unique file key
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = fileName.split('.').pop()
    const key = `${userId}/progress/${timestamp}-${randomId}.${fileExtension}`

    // Upload to R2
    await c.env.R2_BUCKET.put(key, binaryData, { 
      httpMetadata: { 
        contentType: fileType,
        contentLength: binaryData.length.toString()
      } 
    })

    // Index in D1
    try {
      await c.env.DB.prepare('INSERT OR REPLACE INTO media (user_id, r2_key, content_type, created_at) VALUES (?, ?, ?, ?)')
        .bind(userId, key, fileType, Date.now())
        .run()
      
      // First upload achievement
      try {
        const ach = await c.env.DB.prepare('INSERT OR IGNORE INTO achievements (user_id, code, points) VALUES (?, ?, ?)')
          .bind(userId, 'first_upload', 25).run()
        // @ts-ignore
        if (ach?.meta?.changes > 0) {
          await c.env.DB.prepare('INSERT INTO points_ledger (user_id, points, reason) VALUES (?, ?, ?)')
            .bind(userId, 25, 'first_upload').run()
        }
      } catch (_) {}
    } catch (_) {}

    return jsonCORS(origin, { key, success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'Base64 upload failed' }, 500)
  }
})

// GET /api/media
app.get('/api/media', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  // Get existing D1 entries with metadata
  const d1Media = await c.env.DB.prepare('SELECT r2_key, progress_type, description, privacy_level, metadata, created_at FROM media WHERE user_id = ?')
    .bind(userId)
    .all()
  
  const d1Map = new Map((d1Media.results || []).map((m: any) => [m.r2_key, m]))

  // Use R2 as source of truth, sync with D1
  const list = await c.env.R2_BUCKET.list({ prefix: `${userId}/`, limit: 1000 })
  const itemsR2 = (list.objects || []).map((o: any) => {
    const ct = o.httpMetadata?.contentType || guessContentTypeFromKey(o.key)
    const d1Entry = d1Map.get(o.key)
    
    return {
      key: o.key,
      contentType: ct,
      createdAt: (o.uploaded ? new Date(o.uploaded).toISOString() : undefined),
      progressType: d1Entry?.progress_type || 'progress',
      description: d1Entry?.description || '',
      privacyLevel: d1Entry?.privacy_level || 'private',
      metadata: d1Entry?.metadata ? JSON.parse(d1Entry.metadata || '{}') : {},
      url: `${new URL(c.req.url).origin}/api/media/${encodeURIComponent(o.key)}?token=${encodeURIComponent(token)}`
    }
  })
  
  // Sync D1 with R2 truth: remove stale entries and add missing ones
  try {
    // Get R2 keys
    const r2Keys = new Set((list.objects || []).map(o => o.key))
    
    // Remove D1 entries that don't exist in R2
    for (const d1Entry of (d1Media.results || [])) {
      if (!r2Keys.has(d1Entry.r2_key)) {
        await c.env.DB.prepare('DELETE FROM media WHERE user_id = ? AND r2_key = ?')
          .bind(userId, d1Entry.r2_key).run()
      }
    }
    
    // Add missing R2 entries to D1
    for (const r2Object of (list.objects || [])) {
      if (!d1Map.has(r2Object.key)) {
        const ct = r2Object.httpMetadata?.contentType || guessContentTypeFromKey(r2Object.key)
        await c.env.DB.prepare('INSERT INTO media (user_id, r2_key, content_type, progress_type, created_at) VALUES (?, ?, ?, ?, ?)')
          .bind(userId, r2Object.key, ct || null, 'progress', Date.now()).run()
      }
    }
  } catch (e) {
    // D1 sync error (non-critical)
  }
  
  return jsonCORS(origin, { items: itemsR2 })
})

// GET /api/media/*
app.get('/api/media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  // Extract object key from URL path
  const fullPath = c.req.path
  let objectKey = fullPath.replace('/api/media/', '')
  try { 
    objectKey = decodeURIComponent(objectKey) 
  } catch (_) {}
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)

  await ensureTables(c.env)

  const userId = user.id
  const isAdmin = user.email === 'iamhollywoodpro@protonmail.com' || user.email === 'iamhollywoodpro@gmail.com'
  const ownerPrefix = `${userId}/`
  const isOwnerPath = objectKey.startsWith(ownerPrefix)
  let allowed = isOwnerPath || isAdmin
  if (!allowed) {
    try {
      const row = await c.env.DB.prepare('SELECT 1 as ok FROM media WHERE user_id = ? AND r2_key = ? LIMIT 1')
        .bind(userId, objectKey).first<any>()
      if (row?.ok === 1) allowed = true
    } catch (_) {}
  }
  if (!allowed) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin)

  const obj = await c.env.R2_BUCKET.get(objectKey)
  if (!obj) return withCORS(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }), origin)
  const guessed = guessContentTypeFromKey(objectKey)
  const headers = new Headers({ 'Content-Type': obj.httpMetadata?.contentType || guessed || 'application/octet-stream' })
  headers.set('Access-Control-Allow-Origin', origin)
  return withCORS(new Response(obj.body, { headers }), origin, c.req.raw)
})

// PUT /api/media/*/metadata - Update media metadata
app.put('/api/media/*/metadata', async (c) => {
  const origin = c.req.header('origin') || '*'
  const fullPath = c.req.path
  let objectKey = fullPath.replace('/api/media/', '').replace('/metadata', '')
  try { 
    objectKey = decodeURIComponent(objectKey) 
  } catch (_) {}
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { progressType, description, privacy } = body

    // Update metadata in database
    await c.env.DB.prepare('UPDATE media SET progress_type = ?, description = ?, privacy_level = ?, metadata = ? WHERE user_id = ? AND r2_key = ?')
      .bind(
        progressType || 'progress',
        description || '',
        privacy || 'private',
        JSON.stringify(body),
        userId,
        objectKey
      )
      .run()

    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'Failed to update metadata' }, 500)
  }
})

// DELETE /api/media/*
app.delete('/api/media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  // Extract object key from URL path
  const fullPath = c.req.path
  let objectKey = fullPath.replace('/api/media/', '')
  try { 
    objectKey = decodeURIComponent(objectKey) 
  } catch (_) {}
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)

  await ensureTables(c.env)

  const userId = user.id
  const isAdmin = user.email === 'iamhollywoodpro@protonmail.com' || user.email === 'iamhollywoodpro@gmail.com'
  const ownerPrefix = `${userId}/`
  const isOwnerPath = objectKey.startsWith(ownerPrefix)
  let allowed = isOwnerPath || isAdmin
  if (!allowed) {
    try {
      const row = await c.env.DB.prepare('SELECT 1 as ok FROM media WHERE user_id = ? AND r2_key = ? LIMIT 1')
        .bind(userId, objectKey).first<any>()
      if (row?.ok === 1) allowed = true
    } catch (_) {}
  }
  if (!allowed) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin)

  await c.env.R2_BUCKET.delete(objectKey)
  try { await c.env.DB.prepare('DELETE FROM media WHERE user_id = ? AND r2_key = ?').bind(userId, objectKey).run() } catch (_) {}
  return withCORS(new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }), origin, c.req.raw)
})

// ---------------- Goals ----------------
app.get('/api/goals', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    // Try production schema first (status column, not progress)
    const rs = await c.env.DB
      .prepare('SELECT id, title, description, target_date, status as progress, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all()
    return jsonCORS(origin, { items: rs.results || [] })
  } catch (e: any) {
    const msg = (e?.message || '').toLowerCase()
    // Fallback: Handle local development schema (progress column)
    if (msg.includes('no such column: status')) {
      try {
        // Use local development schema with progress column
        const rs2 = await c.env.DB
          .prepare('SELECT id, title, description, target_date, progress, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC')
          .bind(userId)
          .all()
        return jsonCORS(origin, { items: rs2.results || [] })
      } catch (e2: any) {
        return jsonCORS(origin, { error: e2?.message || 'DB error' }, 500)
      }
    }
    if (msg.includes('no such column: target_date')) {
      try {
        await c.env.DB.prepare('ALTER TABLE goals ADD COLUMN target_date TEXT').run()
        const rs2 = await c.env.DB
          .prepare('SELECT id, title, description, target_date, progress, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC')
          .bind(userId)
          .all()
        return jsonCORS(origin, { items: rs2.results || [] })
      } catch (e2: any) {
        return jsonCORS(origin, { error: e2?.message || 'DB error' }, 500)
      }
    }
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

app.post('/api/goals', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  const body = await c.req.json().catch(() => ({} as any))
  const title = (body.title || '').toString().trim()
  const description = body.description ?? null
  const target_date = body.target_date ?? null
  if (!title) return jsonCORS(origin, { error: 'Title required' }, 400)
  try {
    // Use production schema directly (with status and explicit timestamps)
    const now = Date.now()
    await c.env.DB
      .prepare('INSERT INTO goals (user_id, title, description, target_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(userId, title, description, target_date, 'active', now, now)
      .run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    const msg = (e?.message || '').toLowerCase()
    // Fallback: Try local development schema with progress column
    if (msg.includes('no column named status') || msg.includes('no such column: status')) {
      try {
        await c.env.DB
          .prepare('INSERT INTO goals (user_id, title, description, target_date, progress) VALUES (?, ?, ?, ?, 0)')
          .bind(userId, title, description, target_date)
          .run()
        return jsonCORS(origin, { success: true })
      } catch (e2: any) {
        return jsonCORS(origin, { error: e2?.message || 'DB error' }, 500)
      }
    }
    if (msg.includes('no column named target_date') || msg.includes('no such column: target_date')) {
      try {
        await c.env.DB.prepare('ALTER TABLE goals ADD COLUMN target_date TEXT').run()
        await c.env.DB
          .prepare('INSERT INTO goals (user_id, title, description, target_date, progress) VALUES (?, ?, ?, ?, 0)')
          .bind(userId, title, description, target_date)
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
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id
  const id = Number(c.req.param('id'))
  if (!id) return jsonCORS(origin, { error: 'Invalid id' }, 400)
  try {
    await c.env.DB.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').bind(id, userId).run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// ---------------- Habits ----------------
app.get('/api/habits', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  try {
    const habits = await c.env.DB
      .prepare('SELECT id, name, emoji, difficulty, days_of_week, created_at FROM habits WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all()

    if (from && to) {
      const logs = await c.env.DB
        .prepare('SELECT habit_id, "date" as date FROM habit_logs WHERE user_id = ? AND "date" BETWEEN ? AND ? ORDER BY "date" DESC')
        .bind(userId, from, to)
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
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  const body = await c.req.json().catch(() => ({} as any))
  const name = (body.name || '').toString().trim()
  if (!name) return jsonCORS(origin, { error: 'Name required' }, 400)
  const emoji = body.emoji || '💪'
  const difficulty = body.difficulty || 'Medium'
  const days = Array.isArray(body.days_of_week) ? JSON.stringify(body.days_of_week) : JSON.stringify([0,1,2,3,4,5,6])
  try {
    await c.env.DB
      .prepare('INSERT INTO habits (user_id, name, emoji, difficulty, days_of_week) VALUES (?, ?, ?, ?, ?)')
      .bind(userId, name, emoji, difficulty, days)
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
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  const habitId = Number(c.req.param('id'))
  if (!habitId) return jsonCORS(origin, { error: 'Invalid habit id' }, 400)

  const body = await c.req.json().catch(() => ({} as any))
  const date = (body.date || '').toString().slice(0, 10)
  const remove = !!body.remove
  if (!date) return jsonCORS(origin, { error: 'date required (YYYY-MM-DD)' }, 400)
  try {
    if (remove) {
      await c.env.DB.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ? AND "date" = ?')
        .bind(habitId, userId, date).run()
      return jsonCORS(origin, { success: true, removed: true })
    } else {
      await c.env.DB.prepare('INSERT INTO habit_logs (habit_id, user_id, "date") VALUES (?, ?, ?)')
        .bind(habitId, userId, date).run()
      
      // Grant achievements for habit completion
      await grantAchievement(c.env, userId, 'first_habit_log', 10, 'First Habit Completed')
      await grantAchievement(c.env, userId, 'daily_habit_complete', 10, 'Habit Hero')
      
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
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id
  const habitId = Number(c.req.param('id'))
  if (!habitId) return jsonCORS(origin, { error: 'Invalid habit id' }, 400)
  try {
    await c.env.DB.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?').bind(habitId, userId).run()
    await c.env.DB.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').bind(habitId, userId).run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// ---------------- Nutrition ----------------
app.get('/api/nutrition', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  const date = (url.searchParams.get('date') || '').slice(0, 10)
  if (!date) return jsonCORS(origin, { error: 'date required (YYYY-MM-DD)' }, 400)
  try {
    const rs = await c.env.DB
      .prepare('SELECT id, meal_name, meal_type, calories, protein, carbs, fat, fiber, sugar, serving_size, food_image, food_id, category, addons, "date" FROM nutrition_logs WHERE user_id = ? AND "date" = ? ORDER BY id ASC')
      .bind(userId, date)
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
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  const body = await c.req.json().catch(() => ({} as any))
  const date = (body.date || '').toString().slice(0, 10)
  if (!date) return jsonCORS(origin, { error: 'date required (YYYY-MM-DD)' }, 400)
  const meal_name = (body.meal_name || '').toString()
  const meal_type = (body.meal_type || 'snacks').toString()
  const calories = Number(body.calories || 0)
  const protein = Number(body.protein || 0)
  const carbs = Number(body.carbs || 0)
  const fat = Number(body.fat || 0)
  const fiber = Number(body.fiber || 0)
  const sugar = Number(body.sugar || 0)
  const serving_size = (body.serving_size || '1 serving').toString()
  const food_image = (body.food_image || '').toString()
  const food_id = (body.food_id || '').toString()
  const category = (body.category || '').toString()
  const addons = (body.addons || '').toString()
  try {
    await c.env.DB
      .prepare('INSERT INTO nutrition_logs (user_id, meal_name, meal_type, calories, protein, carbs, fat, fiber, sugar, serving_size, food_image, food_id, category, addons, "date") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(userId, meal_name, meal_type, calories, protein, carbs, fat, fiber, sugar, serving_size, food_image, food_id, category, addons, date)
      .run()
    
    // Grant achievements for nutrition logging
    await grantAchievement(c.env, userId, 'first_nutrition_entry', 10, 'First Nutrition Entry')
    await grantAchievement(c.env, userId, 'daily_nutrition_log', 8, 'Nutrition Tracker')
    
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
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  const id = Number(c.req.param('id'))
  if (!id) return jsonCORS(origin, { error: 'Invalid id' }, 400)
  try {
    await c.env.DB.prepare('DELETE FROM nutrition_logs WHERE id = ? AND user_id = ?').bind(id, userId).run()
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// ---------------- Achievements ----------------
app.get('/api/achievements', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const itemsRs = await c.env.DB
      .prepare('SELECT id, code, points, created_at FROM achievements WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all()
    const pointsRs = await c.env.DB
      .prepare('SELECT COALESCE(SUM(points), 0) as total FROM points_ledger WHERE user_id = ?')
      .bind(userId)
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

// ---------------- Profile Endpoints ----------------
// GET /api/profile
app.get('/api/profile', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const profile = await c.env.DB
      .prepare('SELECT user_id, name, bio, targets, profile_picture, updated_at FROM user_profiles WHERE user_id = ?')
      .bind(userId)
      .first()
    
    if (!profile) {
      // Create default profile
      const defaultProfile = {
        user_id: userId,
        name: user.email?.split('@')[0] || 'User',
        bio: '',
        targets: JSON.stringify({}),
        profile_picture: null
      }
      await c.env.DB
        .prepare('INSERT INTO user_profiles (user_id, name, bio, targets, profile_picture) VALUES (?, ?, ?, ?, ?)')
        .bind(defaultProfile.user_id, defaultProfile.name, defaultProfile.bio, defaultProfile.targets, defaultProfile.profile_picture)
        .run()
      return jsonCORS(origin, defaultProfile)
    }
    
    return jsonCORS(origin, {
      user_id: profile.user_id,
      name: profile.name,
      bio: profile.bio,
      targets: profile.targets ? JSON.parse(profile.targets) : {},
      profile_picture: profile.profile_picture,
      updated_at: profile.updated_at
    })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// PUT /api/profile
app.put('/api/profile', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const name = body.name?.trim() || user.email?.split('@')[0] || 'User'
    const bio = body.bio?.trim() || ''
    const targets = body.targets ? JSON.stringify(body.targets) : '{}'
    const profilePicture = body.profile_picture || null
    
    await c.env.DB
      .prepare('INSERT OR REPLACE INTO user_profiles (user_id, name, bio, targets, profile_picture, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
      .bind(userId, name, bio, targets, profilePicture)
      .run()
    
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// ---------------- Admin Endpoints ----------------
// Helper function to check if user is admin
const isAdminUser = (user: any) => {
  return ADMIN_EMAILS.includes(user?.email || '')
}

// Admin setup endpoint removed for security after account creation

// GET /api/admin/users
app.get('/api/admin/users', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id
  if (!isAdminUser(user)) return jsonCORS(origin, { error: 'Forbidden' }, 403)

  await ensureTables(c.env)

  try {
    const users = await c.env.DB
      .prepare('SELECT user_id, name, bio, targets, updated_at FROM user_profiles ORDER BY updated_at DESC')
      .all()
    
    const userList = (users.results || []).map((u: any) => ({
      id: u.user_id,
      name: u.name,
      bio: u.bio,
      targets: u.targets ? JSON.parse(u.targets) : {},
      updated_at: u.updated_at
    }))
    
    return jsonCORS(origin, { users: userList })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// GET /api/admin/user/:id/profile
app.get('/api/admin/user/:id/profile', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id
  if (!isAdminUser(user)) return jsonCORS(origin, { error: 'Forbidden' }, 403)

  const targetUserId = c.req.param('id')
  await ensureTables(c.env)

  try {
    const profile = await c.env.DB
      .prepare('SELECT user_id, name, bio, targets, updated_at FROM user_profiles WHERE user_id = ?')
      .bind(targetUserId)
      .first()
    
    if (!profile) return jsonCORS(origin, { error: 'User not found' }, 404)
    
    return jsonCORS(origin, {
      user_id: profile.user_id,
      name: profile.name,
      bio: profile.bio,
      targets: profile.targets ? JSON.parse(profile.targets) : {},
      updated_at: profile.updated_at
    })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// GET /api/admin/user/:id/media
app.get('/api/admin/user/:id/media', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id
  if (!isAdminUser(user)) return jsonCORS(origin, { error: 'Forbidden' }, 403)

  const targetUserId = c.req.param('id')
  await ensureTables(c.env)

  try {
    const media = await c.env.DB
      .prepare('SELECT r2_key as key, content_type as contentType, created_at as createdAt, flagged, flag_reason FROM media WHERE user_id = ? ORDER BY created_at DESC')
      .bind(targetUserId)
      .all()
    
    const items = (media.results || []).map((m: any) => ({
      key: m.key,
      contentType: m.contentType,
      createdAt: m.createdAt,
      url: `${new URL(c.req.url).origin}/api/admin/media/${encodeURIComponent(m.key)}?token=${encodeURIComponent(token)}`
    }))
    
    return jsonCORS(origin, { media: items })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'DB error' }, 500)
  }
})

// GET /api/admin/media/* - Admin stream media
app.get('/api/admin/media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  // Extract object key from URL path
  const fullPath = c.req.path
  let objectKey = fullPath.replace('/api/admin/media/', '')
  try { 
    objectKey = decodeURIComponent(objectKey) 
  } catch (_) {}
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)
  if (!isAdminUser(user)) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin, c.req.raw)

  await ensureTables(c.env)

  // Verify ownership via D1 (same as user endpoint but admin can access any)
  let allowed = false
  try {
    const row = await c.env.DB.prepare('SELECT 1 as ok FROM media WHERE user_id = ? AND r2_key = ? LIMIT 1')
      .bind(userId, objectKey).first<any>()
    if (row?.ok === 1) allowed = true
  } catch (_) {}
  
  // Also check if admin is trying to access any media (allow if exists in D1)
  if (!allowed) {
    try {
      const mediaRow = await c.env.DB.prepare('SELECT user_id FROM media WHERE r2_key = ? LIMIT 1')
        .bind(objectKey).first<any>()
      if (mediaRow) allowed = true // Admin can access any existing media
    } catch (_) {}
  }
  
  if (!allowed) return withCORS(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }), origin)

  const obj = await c.env.R2_BUCKET.get(objectKey)
  if (!obj) return withCORS(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }), origin)
  const guessed = guessContentTypeFromKey(objectKey)
  const headers = new Headers({ 'Content-Type': obj.httpMetadata?.contentType || guessed || 'application/octet-stream' })
  headers.set('Access-Control-Allow-Origin', origin)
  return withCORS(new Response(obj.body, { headers }), origin, c.req.raw)
})

// DELETE /api/admin/media/* - Admin delete media
app.delete('/api/admin/media/*', async (c) => {
  const origin = c.req.header('origin') || '*'
  // Extract object key from URL path
  const fullPath = c.req.path
  let objectKey = fullPath.replace('/api/admin/media/', '')
  try { 
    objectKey = decodeURIComponent(objectKey) 
  } catch (_) {}
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)
  if (!isAdminUser(user)) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin, c.req.raw)

  await ensureTables(c.env)

  try {
    // Delete from R2 first
    await c.env.R2_BUCKET.delete(objectKey)
    // Delete from D1
    await c.env.DB.prepare('DELETE FROM media WHERE r2_key = ?').bind(objectKey).run()
    
    return jsonCORS(origin, { success: true })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'Delete failed' }, 500)
  }
})

// POST /api/admin/media/*/flag - Admin flag media
app.post('/api/admin/media/*/flag', async (c) => {
  const origin = c.req.header('origin') || '*'
  // Extract object key from URL path
  const fullPath = c.req.path
  let objectKey = fullPath.replace('/api/admin/media/', '').replace('/flag', '')
  try { 
    objectKey = decodeURIComponent(objectKey) 
  } catch (_) {}
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return withCORS(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }), origin, c.req.raw)
  if (!isAdminUser(user)) return withCORS(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }), origin, c.req.raw)

  await ensureTables(c.env)

  try {
    const { reason } = await c.req.json()
    const now = new Date().toISOString()
    
    // Check if media exists and update flag
    const result = await c.env.DB.prepare('UPDATE media SET flagged = 1, flag_reason = ?, flagged_at = ?, flagged_by = ? WHERE r2_key = ?')
      .bind(reason || 'Inappropriate content', now, user.id, objectKey).run()
    
    if (result.changes === 0) {
      return jsonCORS(origin, { error: 'Media not found' }, 404)
    }
    
    return jsonCORS(origin, { success: true, message: 'Media flagged successfully' })
  } catch (e: any) {
    return jsonCORS(origin, { error: e?.message || 'Failed to flag media' }, 500)
  }
})

// ================ SOCIAL & COMMUNITY FEATURES ================

// POST /api/posts - Create a social post
app.post('/api/posts', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { content, media_url, post_type = 'progress', tags = [], visibility = 'friends' } = body

    if (!content?.trim()) {
      return jsonCORS(origin, { error: 'Content is required' }, 400)
    }

    const now = new Date().toISOString()
    const post = await c.env.DB.prepare(`
      INSERT INTO social_posts (user_id, content, media_url, post_type, tags, visibility, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      userId, 
      content, 
      media_url || null, 
      post_type, 
      JSON.stringify(tags), 
      visibility, 
      now
    ).first<any>()

    // Award points for posting
    await c.env.DB.prepare(`
      INSERT INTO user_stats (user_id, total_points, posts_count)
      VALUES (?, 5, 1)
      ON CONFLICT(user_id) DO UPDATE SET
        total_points = total_points + 5,
        posts_count = posts_count + 1,
        updated_at = ?
    `).bind(userId, now).run()

    return jsonCORS(origin, { 
      success: true, 
      post: {
        ...post,
        tags: JSON.parse(post.tags || '[]')
      }
    })
  } catch (e: any) {
    console.error('Post creation error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to create post' }, 500)
  }
})

// GET /api/posts - Get social posts feed
app.get('/api/posts', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Get posts from friends and public posts
    const posts = await c.env.DB.prepare(`
      SELECT 
        p.*,
        up.name as user_name,
        up.bio as user_bio,
        (SELECT COUNT(*) FROM social_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM social_comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM social_likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM social_posts p
      LEFT JOIN user_profiles up ON p.user_id = up.user_id
      WHERE 
        p.visibility IN ('public', 'friends') 
        OR p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, userId, limit, offset).all<any>()

    const formattedPosts = posts.results?.map(post => ({
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      is_liked: post.is_liked > 0,
      stats: {
        likes: post.likes_count,
        comments: post.comments_count,
        shares: 0
      }
    })) || []

    return jsonCORS(origin, { posts: formattedPosts })
  } catch (e: any) {
    console.error('Posts fetch error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to fetch posts' }, 500)
  }
})

// POST /api/posts/:id/like - Like/unlike a post
app.post('/api/posts/:id/like', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const postId = c.req.param('id')
    
    // Check if already liked
    const existing = await c.env.DB.prepare(`
      SELECT id FROM social_likes WHERE user_id = ? AND post_id = ?
    `).bind(userId, postId).first<any>()

    const now = new Date().toISOString()

    if (existing) {
      // Unlike
      await c.env.DB.prepare(`
        DELETE FROM social_likes WHERE user_id = ? AND post_id = ?
      `).bind(userId, postId).run()
      
      return jsonCORS(origin, { success: true, action: 'unliked' })
    } else {
      // Like
      await c.env.DB.prepare(`
        INSERT INTO social_likes (user_id, post_id, created_at)
        VALUES (?, ?, ?)
      `).bind(userId, postId, now).run()

      // Award 1 point for liking a post
      await c.env.DB.prepare(`
        INSERT INTO user_stats (user_id, total_points)
        VALUES (?, 1)
        ON CONFLICT(user_id) DO UPDATE SET
          total_points = total_points + 1,
          updated_at = ?
      `).bind(userId, now).run()

      // Award 2 points to post author for receiving a like
      const postAuthor = await c.env.DB.prepare(`
        SELECT user_id FROM social_posts WHERE id = ?
      `).bind(postId).first<any>()
      
      if (postAuthor?.user_id && postAuthor.user_id !== userId) {
        await c.env.DB.prepare(`
          INSERT INTO user_stats (user_id, total_points, total_likes_received)
          VALUES (?, 2, 1)
          ON CONFLICT(user_id) DO UPDATE SET
            total_points = total_points + 2,
            total_likes_received = total_likes_received + 1,
            updated_at = ?
        `).bind(postAuthor.user_id, now).run()
      }

      return jsonCORS(origin, { success: true, action: 'liked', points_awarded: 1 })
    }
  } catch (e: any) {
    console.error('Like error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to like post' }, 500)
  }
})

// POST /api/posts/:id/comments - Add comment to post
app.post('/api/posts/:id/comments', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const postId = c.req.param('id')
    const body = await c.req.json()
    const { content } = body

    if (!content?.trim()) {
      return jsonCORS(origin, { error: 'Comment content is required' }, 400)
    }

    const now = new Date().toISOString()
    const comment = await c.env.DB.prepare(`
      INSERT INTO social_comments (post_id, user_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(postId, userId, content, now, now).first<any>()

    return jsonCORS(origin, { success: true, comment })
  } catch (e: any) {
    console.error('Comment error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to add comment' }, 500)
  }
})

// GET /api/posts/:id/comments - Get comments for a post
app.get('/api/posts/:id/comments', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const postId = c.req.param('id')
    
    const comments = await c.env.DB.prepare(`
      SELECT 
        c.*,
        up.name as user_name,
        up.bio as user_bio
      FROM social_comments c
      LEFT JOIN user_profiles up ON c.user_id = up.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).bind(postId).all<any>()

    return jsonCORS(origin, { comments: comments.results || [] })
  } catch (e: any) {
    console.error('Comments fetch error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to fetch comments' }, 500)
  }
})

// ================ FRIENDS SYSTEM ================

// POST /api/friends/invite - Send friend invitation
app.post('/api/friends/invite', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { email, phone, message, invitee_name } = body

    if (!email && !phone) {
      return jsonCORS(origin, { error: 'Email or phone number required' }, 400)
    }

    // Get user's profile for personalized message
    const userProfile = await c.env.DB.prepare(`
      SELECT up.name as full_name
      FROM user_profiles up
      WHERE up.user_id = ?
    `).bind(userId).first<any>()

    const inviterName = userProfile?.full_name || 'A friend'

    // Create compelling invitation message
    const defaultMessage = `🏋️‍♀️ Hey ${invitee_name || 'there'}! 

${inviterName} here - I've been absolutely crushing my fitness goals with StriveTrack and I had to share this with you! 💪

This isn't just another fitness app - it's a whole community where we:
✨ Track our progress with beautiful visualizations
🎯 Challenge each other to stay motivated
🏆 Celebrate wins together on our social feed
📊 See real results with smart analytics

I've already gained ${Math.floor(Math.random() * 50 + 10)} points this week and would love to have you join my fitness squad! 

Ready to level up your fitness journey? Let's do this together! 🚀

Download StriveTrack: [app-link]
Join with code: ${userId.slice(0, 8).toUpperCase()}`

    const finalMessage = message || defaultMessage

    // Store invitation record
    const now = new Date().toISOString()
    const invitation = await c.env.DB.prepare(`
      INSERT INTO friend_invitations (
        inviter_id, email, phone, message, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'sent', ?, ?)
      RETURNING *
    `).bind(
      userId,
      email || null,
      phone || null,
      finalMessage,
      now,
      now
    ).first<any>()

    // Here you would integrate with email/SMS service
    // For now, we'll just return the invitation details
    
    return jsonCORS(origin, { 
      success: true, 
      invitation,
      message: finalMessage,
      preview: 'Invitation created! In production, this would be sent via email/SMS.'
    })
  } catch (e: any) {
    console.error('Invitation error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to send invitation' }, 500)
  }
})

// POST /api/friends/add - Add friend by user ID or email
app.post('/api/friends/add', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { friend_id, email } = body

    let friendId = friend_id

    // If email provided, find user by email
    if (!friendId && email) {
      const friendUser = await c.env.DB.prepare(`
        SELECT id FROM users WHERE email = ?
      `).bind(email).first<any>()
      
      if (!friendUser) {
        return jsonCORS(origin, { error: 'User not found' }, 404)
      }
      friendId = friendUser.id
    }

    if (!friendId) {
      return jsonCORS(origin, { error: 'Friend ID or email required' }, 400)
    }

    if (friendId === userId) {
      return jsonCORS(origin, { error: 'Cannot add yourself as friend' }, 400)
    }

    // Check if friendship already exists
    const existing = await c.env.DB.prepare(`
      SELECT * FROM friendships 
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `).bind(userId, friendId, friendId, userId).first<any>()

    if (existing) {
      return jsonCORS(origin, { error: 'Friendship already exists' }, 400)
    }

    const now = new Date().toISOString()
    
    // Create friendship (pending approval)
    const friendship = await c.env.DB.prepare(`
      INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
      VALUES (?, ?, 'pending', ?, ?)
      RETURNING *
    `).bind(userId, friendId, now, now).first<any>()

    return jsonCORS(origin, { success: true, friendship })
  } catch (e: any) {
    console.error('Add friend error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to add friend' }, 500)
  }
})

// POST /api/friends/:id/accept - Accept friend request
app.post('/api/friends/:id/accept', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const friendshipId = c.req.param('id')
    const now = new Date().toISOString()

    // Update friendship status
    const updated = await c.env.DB.prepare(`
      UPDATE friendships 
      SET status = 'accepted', updated_at = ?
      WHERE id = ? AND friend_id = ?
      RETURNING *
    `).bind(now, friendshipId, userId).first<any>()

    if (!updated) {
      return jsonCORS(origin, { error: 'Friendship request not found' }, 404)
    }

    // Create reciprocal friendship
    await c.env.DB.prepare(`
      INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
      VALUES (?, ?, 'accepted', ?, ?)
    `).bind(userId, updated.user_id, now, now).run()

    return jsonCORS(origin, { success: true, friendship: updated })
  } catch (e: any) {
    console.error('Accept friend error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to accept friend request' }, 500)
  }
})

// GET /api/friends - Get user's friends list
app.get('/api/friends', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const status = url.searchParams.get('status') || 'accepted'

    const friends = await c.env.DB.prepare(`
      SELECT 
        f.*,
        up.name as friend_name,
        up.bio as friend_bio,
        us.total_points as friend_points,
        us.last_active
      FROM friendships f
      LEFT JOIN user_profiles up ON f.addressee_id = up.user_id
      LEFT JOIN user_stats us ON f.addressee_id = us.user_id
      WHERE f.requester_id = ? AND f.status = ?
      ORDER BY f.created_at DESC
    `).bind(userId, status).all<any>()

    return jsonCORS(origin, { friends: friends.results || [] })
  } catch (e: any) {
    console.error('Friends fetch error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to fetch friends' }, 500)
  }
})

// ================ CHALLENGES SYSTEM ================

// POST /api/challenges - Create a friend challenge
app.post('/api/challenges', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { friend_id, challenge_type, title, description, target_value, duration_days = 7, points_reward = 50 } = body

    if (!friend_id || !challenge_type || !title || !target_value) {
      return jsonCORS(origin, { error: 'Missing required challenge fields' }, 400)
    }

    // Verify friendship exists
    const friendship = await c.env.DB.prepare(`
      SELECT 1 FROM friendships 
      WHERE user_id = ? AND friend_id = ? AND status = 'accepted'
    `).bind(userId, friend_id).first<any>()

    if (!friendship) {
      return jsonCORS(origin, { error: 'You can only challenge friends' }, 400)
    }

    const now = new Date().toISOString()
    const endDate = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()

    const challenge = await c.env.DB.prepare(`
      INSERT INTO friend_challenges (
        challenger_id, challenged_id, challenge_type, title, description,
        target_value, points_reward, start_date, end_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
      RETURNING *
    `).bind(
      userId, friend_id, challenge_type, title, description,
      target_value, points_reward, now, endDate, now, now
    ).first<any>()

    return jsonCORS(origin, { success: true, challenge })
  } catch (e: any) {
    console.error('Challenge creation error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to create challenge' }, 500)
  }
})

// GET /api/challenges - Get user's challenges
app.get('/api/challenges', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const challenges = await c.env.DB.prepare(`
      SELECT 
        c.*,
        challenger_profile.name as challenger_email,
        challenger_profile.full_name as challenger_name,
        challenger_profile.profile_picture_url as challenger_avatar,
        challenged_profile.name as challenged_email,
        challenged_profile.full_name as challenged_name,
        challenged_profile.profile_picture_url as challenged_avatar
      FROM friend_challenges c
      LEFT JOIN user_profiles challenger_profile ON c.challenger_id = challenger_profile.user_id
      LEFT JOIN user_profiles challenged_profile ON c.challenged_id = challenged_profile.user_id
      WHERE (c.challenger_id = ? OR c.challenged_id = ?) AND c.status = 'active'
      ORDER BY c.created_at DESC
    `).bind(userId, userId).all<any>()

    return jsonCORS(origin, { challenges: challenges.results || [] })
  } catch (e: any) {
    console.error('Challenges fetch error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to fetch challenges' }, 500)
  }
})

// POST /api/challenges/:id/progress - Update challenge progress
app.post('/api/challenges/:id/progress', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const challengeId = c.req.param('id')
    const body = await c.req.json()
    const { progress_value } = body

    if (typeof progress_value !== 'number') {
      return jsonCORS(origin, { error: 'Valid progress value required' }, 400)
    }

    const now = new Date().toISOString()

    // Update progress for the user
    const field = userId === (await c.env.DB.prepare(`SELECT challenger_id FROM friend_challenges WHERE id = ?`).bind(challengeId).first<any>())?.challenger_id
      ? 'challenger_progress'
      : 'challenged_progress'

    const updated = await c.env.DB.prepare(`
      UPDATE friend_challenges 
      SET ${field} = ?, updated_at = ?
      WHERE id = ? AND (challenger_id = ? OR challenged_id = ?)
      RETURNING *
    `).bind(progress_value, now, challengeId, userId, userId).first<any>()

    if (!updated) {
      return jsonCORS(origin, { error: 'Challenge not found' }, 404)
    }

    // Check if challenge is completed
    if (updated.challenger_progress >= updated.target_value || updated.challenged_progress >= updated.target_value) {
      const winnerId = updated.challenger_progress >= updated.target_value ? updated.challenger_id : updated.challenged_id
      
      // Award points to winner
      await c.env.DB.prepare(`
        INSERT INTO user_stats (user_id, total_points, challenges_won)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id) DO UPDATE SET
          total_points = total_points + ?,
          challenges_won = challenges_won + 1,
          updated_at = ?
      `).bind(winnerId, updated.points_reward, updated.points_reward, now).run()

      // Mark challenge as completed
      await c.env.DB.prepare(`
        UPDATE friend_challenges 
        SET status = 'completed', winner_id = ?, updated_at = ?
        WHERE id = ?
      `).bind(winnerId, now, challengeId).run()
    }

    return jsonCORS(origin, { success: true, challenge: updated })
  } catch (e: any) {
    console.error('Challenge progress error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to update progress' }, 500)
  }
})

// ================ CHAT SYSTEM ================

// POST /api/chat/messages - Send a chat message
app.post('/api/chat/messages', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { recipient_id, content, message_type = 'text' } = body

    if (!recipient_id || !content?.trim()) {
      return jsonCORS(origin, { error: 'Recipient and content are required' }, 400)
    }

    // Verify friendship exists
    const friendship = await c.env.DB.prepare(`
      SELECT 1 FROM friendships 
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
      AND status = 'accepted'
    `).bind(userId, recipient_id, recipient_id, userId).first<any>()

    if (!friendship) {
      return jsonCORS(origin, { error: 'You can only message friends' }, 400)
    }

    const now = new Date().toISOString()
    const message = await c.env.DB.prepare(`
      INSERT INTO chat_messages (sender_id, recipient_id, content, message_type, created_at)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(userId, recipient_id, content, message_type, now).first<any>()

    return jsonCORS(origin, { success: true, message })
  } catch (e: any) {
    console.error('Chat message error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to send message' }, 500)
  }
})

// GET /api/chat/messages/:friend_id - Get chat messages with a friend
app.get('/api/chat/messages/:friend_id', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const friendId = c.req.param('friend_id')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const messages = await c.env.DB.prepare(`
      SELECT 
        m.*,
        sender.email as sender_email,
        sender_profile.full_name as sender_name,
        sender_profile.profile_picture_url as sender_avatar
      FROM chat_messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN user_profiles sender_profile ON sender.id = sender_profile.user_id
      WHERE 
        (m.sender_id = ? AND m.recipient_id = ?) OR 
        (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, friendId, friendId, userId, limit, offset).all<any>()

    // Mark messages as read
    await c.env.DB.prepare(`
      UPDATE chat_messages 
      SET read_at = CURRENT_TIMESTAMP
      WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL
    `).bind(friendId, userId).run()

    return jsonCORS(origin, { messages: (messages.results || []).reverse() })
  } catch (e: any) {
    console.error('Chat messages fetch error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to fetch messages' }, 500)
  }
})

// POST /api/user/status - Update user online status
app.post('/api/user/status', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { status = 'online' } = body
    const now = new Date().toISOString()

    await c.env.DB.prepare(`
      INSERT INTO user_stats (user_id, last_active, online_status)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        last_active = ?,
        online_status = ?,
        updated_at = ?
    `).bind(userId, now, status, now, status, now).run()

    return jsonCORS(origin, { success: true, status })
  } catch (e: any) {
    console.error('Status update error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to update status' }, 500)
  }
})

// ================ LEADERBOARDS ================

// GET /api/leaderboard - Get points leaderboard
app.get('/api/leaderboard', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const type = url.searchParams.get('type') || 'global'
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let query = `
      SELECT 
        us.*,
        up.name as full_name,
        up.bio,
        ROW_NUMBER() OVER (ORDER BY us.total_points DESC) as rank
      FROM user_stats us
      LEFT JOIN user_profiles up ON us.user_id = up.user_id
    `

    if (type === 'friends') {
      query += `
        WHERE us.user_id = ? OR EXISTS (
          SELECT 1 FROM friendships f 
          WHERE ((f.requester_id = ? AND f.addressee_id = us.user_id) OR (f.addressee_id = ? AND f.requester_id = us.user_id))
          AND f.status = 'accepted'
        )
      `
    }

    query += `
      ORDER BY us.total_points DESC
      LIMIT ?
    `

    const params = type === 'friends' ? [userId, userId, userId, limit] : [limit]
    const leaderboard = await c.env.DB.prepare(query).bind(...params).all<any>()

    return jsonCORS(origin, { leaderboard: leaderboard.results || [] })
  } catch (e: any) {
    console.error('Leaderboard fetch error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to fetch leaderboard' }, 500)
  }
})

// POST /api/achievements/award - Award points for achievement (called by frontend when user completes something)
app.post('/api/achievements/award', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  const userId = user.id

  await ensureTables(c.env)

  try {
    const body = await c.req.json()
    const { achievement_type, points = 10, description = '' } = body

    if (!achievement_type) {
      return jsonCORS(origin, { error: 'Achievement type is required' }, 400)
    }

    const now = new Date().toISOString()

    // Award points
    await c.env.DB.prepare(`
      INSERT INTO user_stats (user_id, total_points, achievements_count)
      VALUES (?, ?, 1)
      ON CONFLICT(user_id) DO UPDATE SET
        total_points = total_points + ?,
        achievements_count = achievements_count + 1,
        updated_at = ?
    `).bind(userId, points, points, now).run()

    // Create achievement post automatically
    await c.env.DB.prepare(`
      INSERT INTO social_posts (user_id, content, post_type, tags, visibility, created_at, updated_at)
      VALUES (?, ?, 'achievement', ?, 'public', ?, ?)
    `).bind(
      userId,
      `🎉 Just completed: ${achievement_type}! ${description} (+${points} points)`,
      JSON.stringify([achievement_type, 'achievement']),
      now,
      now
    ).run()

    return jsonCORS(origin, { 
      success: true, 
      points_awarded: points,
      message: `Congratulations! You earned ${points} points for ${achievement_type}!`
    })
  } catch (e: any) {
    console.error('Achievement award error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to award achievement points' }, 500)
  }
})

// DEBUG: Test post creation without auth (REMOVE IN PRODUCTION)
app.post('/api/debug/create-post', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    await ensureTables(c.env)
    
    const { content, postType } = await c.req.json()
    const testUserId = '737774bcd-d0ba-4a5a-921e-a392df28df26'
    
    // Create post
    const result = await c.env.DB.prepare(`
      INSERT INTO social_posts (user_id, content, post_type, visibility, created_at, updated_at) 
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(testUserId, content, postType || 'progress', 'friends').run()
    
    return jsonCORS(origin, {
      success: true,
      message: 'Post created successfully!',
      post: {
        id: result.meta?.last_row_id,
        content,
        post_type: postType || 'progress',
        user_id: testUserId
      }
    })
  } catch (e: any) {
    console.error('Debug post creation error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to create post' }, 500)
  }
})

// DEBUG: Get posts without auth (REMOVE IN PRODUCTION)  
app.get('/api/debug/posts', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    await ensureTables(c.env)
    
    const posts = await c.env.DB.prepare(`
      SELECT p.*, up.name as user_name, up.bio
      FROM social_posts p
      LEFT JOIN user_profiles up ON p.user_id = up.user_id
      ORDER BY p.created_at DESC
      LIMIT 20
    `).all()
    
    return jsonCORS(origin, {
      success: true,
      posts: posts.results || []
    })
  } catch (e: any) {
    console.error('Debug posts fetch error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to fetch posts' }, 500)
  }
})

// DEBUG: Get users without auth (REMOVE IN PRODUCTION)
app.get('/api/debug/users', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    await ensureTables(c.env)
    
    const users = await c.env.DB.prepare(`
      SELECT up.*, us.total_posts, us.total_friends, us.total_likes_received, us.total_challenges_won, us.streak_days
      FROM user_profiles up
      LEFT JOIN user_stats us ON up.user_id = us.user_id
      ORDER BY us.total_challenges_won DESC NULLS LAST
      LIMIT 10
    `).all()
    
    return jsonCORS(origin, { success: true, users: users.results || [] })
  } catch (e: any) {
    console.error('Debug users error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to get users' }, 500)
  }
})

// DEBUG: Get friends without auth (REMOVE IN PRODUCTION)
app.get('/api/debug/friends', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    await ensureTables(c.env)
    
    const friends = await c.env.DB.prepare(`
      SELECT COUNT(*) as total_friendships
      FROM friendships
      WHERE status = 'accepted'
    `).all()
    
    return jsonCORS(origin, { success: true, friends: friends.results || [], message: 'Friends system ready' })
  } catch (e: any) {
    console.error('Debug friends error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to get friends' }, 500)
  }
})

// DEBUG: Get leaderboard without auth (REMOVE IN PRODUCTION)
app.get('/api/debug/leaderboard', async (c) => {
  const origin = c.req.header('origin') || '*'
  
  try {
    await ensureTables(c.env)
    
    const leaderboard = await c.env.DB.prepare(`
      SELECT up.name, up.bio, 
             us.total_points, us.posts_count, us.challenges_won, us.streak_days, us.total_likes_received
      FROM user_stats us
      JOIN user_profiles up ON us.user_id = up.user_id
      ORDER BY us.total_points DESC, us.challenges_won DESC
      LIMIT 10
    `).all()
    
    return jsonCORS(origin, { success: true, leaderboard: leaderboard.results || [] })
  } catch (e: any) {
    console.error('Debug leaderboard error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to get leaderboard' }, 500)
  }
})

// GET /api/achievements/:userId - Get user achievements and points
app.get('/api/achievements/:userId', async (c) => {
  const origin = c.req.header('origin') || '*'
  const auth = c.req.header('authorization') || ''
  const url = new URL(c.req.url)
  const qToken = url.searchParams.get('token') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : qToken
  const user = await verifyToken(c.env, token)
  if (!user?.id) return jsonCORS(origin, { error: 'Unauthorized' }, 401)
  
  await ensureTables(c.env)

  try {
    const userId = c.req.param('userId')
    
    // Get user stats
    const stats = await c.env.DB.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).bind(userId).first<any>()
    
    if (!stats) {
      // Create initial stats if they don't exist
      await c.env.DB.prepare(`
        INSERT INTO user_stats (user_id) VALUES (?)
      `).bind(userId).run()
      
      const newStats = await c.env.DB.prepare(`
        SELECT * FROM user_stats WHERE user_id = ?
      `).bind(userId).first<any>()
      
      return jsonCORS(origin, { 
        success: true, 
        stats: newStats,
        achievements: []
      })
    }
    
    // Calculate achievements based on stats
    const achievements = []
    
    if (stats.posts_count >= 1) achievements.push({ id: 'first_post', name: 'First Post!', description: 'Created your first post', points: 5 })
    if (stats.posts_count >= 10) achievements.push({ id: 'active_poster', name: 'Active Poster', description: 'Created 10 posts', points: 25 })
    if (stats.total_likes_received >= 5) achievements.push({ id: 'popular', name: 'Popular!', description: 'Received 5 likes', points: 15 })
    if (stats.challenges_won >= 1) achievements.push({ id: 'challenger', name: 'Challenger', description: 'Won your first challenge', points: 20 })
    if (stats.streak_days >= 7) achievements.push({ id: 'week_streak', name: 'Week Warrior', description: 'Maintained a 7-day streak', points: 30 })
    if (stats.total_points >= 100) achievements.push({ id: 'centurion', name: 'Centurion', description: 'Earned 100 points', points: 50 })
    
    return jsonCORS(origin, { 
      success: true, 
      stats,
      achievements,
      total_achievements: achievements.length,
      next_milestone: stats.total_points < 100 ? { target: 100, name: 'Centurion' } : { target: 250, name: 'Champion' }
    })
  } catch (e: any) {
    console.error('Achievements error:', e)
    return jsonCORS(origin, { error: e?.message || 'Failed to get achievements' }, 500)
  }
})

export default app
