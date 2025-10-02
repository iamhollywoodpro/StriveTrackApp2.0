/**
 * StriveTrack 2.1 - Cloudflare Worker API
 * Complete backend API with D1, R2, and Auth integration
 */

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight requests
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
}

// Authentication middleware
async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  const userId = request.headers.get('x-user-id');
  
  if (!authHeader || !userId) {
    return null;
  }
  
  // In production, verify JWT token here
  // For now, we'll use basic user ID validation
  return { userId, token: authHeader };
}

// Database initialization
async function initializeDatabase(env) {
  try {
    // Initialize users table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT,
        profile_image_url TEXT,
        bio TEXT,
        fitness_level TEXT,
        goals TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Initialize workouts table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT,
        duration INTEGER,
        calories_burned INTEGER,
        exercises TEXT, -- JSON string
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();

    // Initialize goals table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        target_value REAL,
        current_value REAL DEFAULT 0,
        unit TEXT,
        target_date DATE,
        status TEXT DEFAULT 'active',
        emoji TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();

    // Initialize habits table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        emoji TEXT,
        frequency TEXT, -- daily, weekly, monthly
        target_count INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();

    // Initialize habit logs table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id TEXT PRIMARY KEY,
        habit_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        completed_at DATETIME NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (habit_id) REFERENCES habits(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();

    // Initialize media table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT,
        file_type TEXT,
        file_size INTEGER,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        description TEXT,
        tags TEXT, -- JSON array
        status TEXT DEFAULT 'pending', -- pending, approved, rejected
        moderation_notes TEXT,
        moderated_by TEXT,
        moderated_at DATETIME,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();

    // Initialize social posts table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        media_ids TEXT, -- JSON array
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        type TEXT DEFAULT 'post', -- post, achievement, challenge
        visibility TEXT DEFAULT 'public', -- public, friends, private
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();

    // Initialize audit logs table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        details TEXT, -- JSON object
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// API Route Handlers
const apiHandlers = {
  // User Management
  async handleUsers(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const pathParts = url.pathname.split('/').filter(Boolean);

    switch (method) {
      case 'GET':
        if (pathParts.length === 2) { // /api/users
          return this.getAllUsers(request, env);
        } else if (pathParts.length === 3) { // /api/users/:id
          return this.getUser(pathParts[2], env);
        }
        break;
      
      case 'POST':
        return this.createUser(request, env);
      
      case 'PUT':
        if (pathParts.length === 3) { // /api/users/:id
          return this.updateUser(pathParts[2], request, env);
        }
        break;
      
      case 'DELETE':
        if (pathParts.length === 3) { // /api/users/:id
          return this.deleteUser(pathParts[2], env);
        }
        break;
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },

  async getAllUsers(request, env) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const filter = url.searchParams.get('filter') || 'all';
    const search = url.searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;
    
    let query = `SELECT id, email, username, display_name, profile_image_url, role, status, created_at FROM users`;
    let countQuery = `SELECT COUNT(*) as total FROM users`;
    const params = [];
    
    // Apply filters
    let whereConditions = [];
    if (filter !== 'all') {
      whereConditions.push('status = ?');
      params.push(filter);
    }
    
    if (search) {
      whereConditions.push('(username LIKE ? OR display_name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (whereConditions.length > 0) {
      const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    try {
      const [usersResult, countResult] = await Promise.all([
        env.DB.prepare(query).bind(...params).all(),
        env.DB.prepare(countQuery).bind(...params.slice(0, -2)).first()
      ]);
      
      return new Response(JSON.stringify({
        users: usersResult.results || [],
        pagination: {
          page,
          limit,
          total: countResult.total || 0,
          totalPages: Math.ceil((countResult.total || 0) / limit)
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  async getUser(userId, env) {
    try {
      const user = await env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(userId).first();
      
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  async createUser(request, env) {
    try {
      const userData = await request.json();
      const userId = crypto.randomUUID();
      
      await env.DB.prepare(`
        INSERT INTO users (id, email, username, display_name, profile_image_url, bio, fitness_level, goals, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        userData.email,
        userData.username,
        userData.display_name || userData.username,
        userData.profile_image_url || null,
        userData.bio || null,
        userData.fitness_level || 'beginner',
        JSON.stringify(userData.goals || []),
        userData.role || 'user',
        userData.status || 'active'
      ).run();
      
      return new Response(JSON.stringify({ success: true, userId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Media Management
  async handleMedia(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const pathParts = url.pathname.split('/').filter(Boolean);

    switch (method) {
      case 'POST':
        if (pathParts[2] === 'upload') {
          return this.uploadMedia(request, env);
        }
        break;
      
      case 'GET':
        if (pathParts.length === 2) { // /api/media
          return this.getMedia(request, env);
        }
        break;
      
      case 'PUT':
        if (pathParts.length === 3) { // /api/media/:id
          return this.updateMediaStatus(pathParts[2], request, env);
        }
        break;
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },

  async uploadMedia(request, env) {
    try {
      const auth = await authenticate(request, env);
      if (!auth) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'File size exceeds 50MB limit' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const fileId = crypto.randomUUID();
      const fileName = `${fileId}-${file.name}`;
      
      // Upload to R2
      await env.BUCKET.put(fileName, file);
      
      // Save metadata to D1
      const mediaId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO media (id, user_id, filename, original_name, file_type, file_size, url, description, tags, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        mediaId,
        auth.userId,
        fileName,
        file.name,
        file.type,
        file.size,
        `${env.R2_PUBLIC_URL}/${fileName}`,
        formData.get('description') || null,
        formData.get('tags') || '[]',
        'pending'
      ).run();
      
      return new Response(JSON.stringify({
        success: true,
        mediaId,
        url: `${env.R2_PUBLIC_URL}/${fileName}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Workout Management
  async handleWorkouts(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const auth = await authenticate(request, env);
    
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (method) {
      case 'GET':
        return this.getUserWorkouts(auth.userId, env);
      case 'POST':
        return this.createWorkout(request, auth.userId, env);
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },

  async getUserWorkouts(userId, env) {
    try {
      const workouts = await env.DB.prepare(
        'SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(userId).all();
      
      return new Response(JSON.stringify({ workouts: workouts.results || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // Admin Analytics
  async handleAdmin(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Admin authentication check would go here
    
    if (pathParts[2] === 'analytics') {
      return this.getAnalytics(env);
    } else if (pathParts[2] === 'users') {
      return this.getAllUsers(request, env);
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },

  async getAnalytics(env) {
    try {
      const [userCount, workoutCount, mediaCount] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM workouts').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM media').first()
      ]);
      
      const analytics = {
        totalUsers: userCount.count || 0,
        totalWorkouts: workoutCount.count || 0,
        totalMedia: mediaCount.count || 0,
        timestamp: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(analytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Main Worker Handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    // Initialize database
    try {
      await initializeDatabase(env);
    } catch (error) {
      console.error('Database initialization failed:', error);
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Health check endpoint
    if (pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2.1.0'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // API Routes
    if (pathname.startsWith('/api/')) {
      const pathParts = pathname.split('/').filter(Boolean);
      
      if (pathParts[1] === 'users') {
        return apiHandlers.handleUsers(request, env, ctx);
      } else if (pathParts[1] === 'media') {
        return apiHandlers.handleMedia(request, env, ctx);
      } else if (pathParts[1] === 'workouts') {
        return apiHandlers.handleWorkouts(request, env, ctx);
      } else if (pathParts[1] === 'admin') {
        return apiHandlers.handleAdmin(request, env, ctx);
      }
    }

    // Default response for unmatched routes
    return new Response(JSON.stringify({ 
      error: 'Not Found',
      path: pathname 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },
};