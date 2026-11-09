/**
 * ============================================================================
 * WEDDING INVITATION SERVER & ADMIN DASHBOARD
 * The Wedding of Arbian & Hima
 * ============================================================================
 * Menggunakan Node.js native http & crypto (zero external npm dependencies).
 * Fitur:
 * - Halaman Login Admin (/login) dengan kredensial aman (username: imaa, pass: imaa123).
 * - Proteksi Admin Dashboard (/admin) di sisi server berbasis session token & cookie.
 * - Pembuat Undangan Personal (/undangan/:slug) dengan nama tamu otomatis.
 * - Database teks di db.js (tanpa SQLite).
 *
 * Jalankan: npm start atau node server.js
 * Akses: http://localhost:3445
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const db = require('./db.js');

const PORT = parseInt(process.env.PORT || '3445', 10);

// ============================================================================
// MANAJEMEN SESI ADMIN (IN-MEMORY SECURE STORE)
// ============================================================================
const activeSessions = new Map();
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 Jam

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    createdAt: Date.now()
  });
  return token;
}

function isValidSession(token) {
  if (!token || !activeSessions.has(token)) return false;
  const session = activeSessions.get(token);
  if (Date.now() - session.createdAt > SESSION_MAX_AGE_MS) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

function destroySession(token) {
  if (token) activeSessions.delete(token);
}

// Helper Parse Cookies dari Header Request
function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// MIME Types untuk Static Files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJson(res, statusCode, data, extraHeaders = {}) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache',
    ...extraHeaders
  });
  res.end(payload);
}

function sendHtml(res, statusCode, html, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
    ...extraHeaders
  });
  res.end(html);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload terlalu besar'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Format JSON tidak valid'));
      }
    });
    req.on('error', err => reject(err));
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// SERVER HTTP UTAMA
// ============================================================================
const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const cookies = parseCookies(req);
  const isAuthenticated = isValidSession(cookies.admin_session);

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // =========================================================================
  // 1. ROUTE HALAMAN LOGIN (/login)
  // =========================================================================
  if (pathname === '/login' && method === 'GET') {
    if (isAuthenticated) {
      res.writeHead(302, { 'Location': '/admin' });
      return res.end();
    }
    const loginFilePath = path.join(__dirname, 'login.html');
    if (fs.existsSync(loginFilePath)) {
      return sendHtml(res, 200, fs.readFileSync(loginFilePath, 'utf-8'));
    }
  }

  // API POST Login Admin
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      const { username, password } = payload;

      if (!username || !password) {
        return sendJson(res, 400, { success: false, error: 'Username dan password wajib diisi' });
      }

      const isValid = db.verifyAdmin(username.trim(), password);
      if (!isValid) {
        return sendJson(res, 401, { success: false, error: 'Username atau password salah!' });
      }

      // Buat token sesi aman
      const sessionToken = createSession();
      console.log(`[Auth] Admin "${username}" berhasil login. Session aktif.`);

      return sendJson(
        res,
        200,
        { success: true, message: 'Login berhasil', redirect: '/admin' },
        { 'Set-Cookie': `admin_session=${sessionToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400` }
      );
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // API & Route Logout Admin (/logout atau /api/auth/logout)
  if ((pathname === '/logout' || pathname === '/api/auth/logout')) {
    if (cookies.admin_session) {
      destroySession(cookies.admin_session);
    }
    console.log('[Auth] Admin logout. Sesi dihapus.');
    res.writeHead(302, {
      'Set-Cookie': `admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
      'Location': '/login'
    });
    return res.end();
  }

  // =========================================================================
  // 2. ROUTE HALAMAN ADMIN DASHBOARD (/admin) - TERPROTEKSI
  // =========================================================================
  if (pathname === '/admin' && method === 'GET') {
    if (!isAuthenticated) {
      console.log('[Security] Akses /admin ditolak: Sesi tidak valid, mengalihkan ke /login');
      res.writeHead(302, { 'Location': '/login' });
      return res.end();
    }
    const adminFilePath = path.join(__dirname, 'admin.html');
    if (fs.existsSync(adminFilePath)) {
      return sendHtml(res, 200, fs.readFileSync(adminFilePath, 'utf-8'));
    }
  }

  // API Protected: Admin Stats
  if (pathname === '/api/admin/stats' && method === 'GET') {
    if (!isAuthenticated) {
      return sendJson(res, 401, { success: false, error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }
    return sendJson(res, 200, { success: true, data: db.getStats() });
  }

  // API Protected: Admin Guests List & Create
  if (pathname === '/api/admin/guests' && method === 'GET') {
    if (!isAuthenticated) {
      return sendJson(res, 401, { success: false, error: 'Akses ditolak.' });
    }
    return sendJson(res, 200, { success: true, data: db.getAllGuests() });
  }

  if (pathname === '/api/admin/guests' && method === 'POST') {
    if (!isAuthenticated) {
      return sendJson(res, 401, { success: false, error: 'Akses ditolak.' });
    }
    try {
      const payload = await parseBody(req);
      const { name } = payload;
      if (!name || !name.trim()) {
        return sendJson(res, 400, { success: false, error: 'Nama tamu wajib diisi' });
      }

      const newGuest = db.addGuest(name.trim());
      console.log(`[Admin] Undangan baru dibuat untuk: "${newGuest.name}" (Slug: ${newGuest.slug})`);
      return sendJson(res, 201, { success: true, data: newGuest });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (pathname.startsWith('/api/admin/guests/') && method === 'DELETE') {
    if (!isAuthenticated) {
      return sendJson(res, 401, { success: false, error: 'Akses ditolak.' });
    }
    const id = pathname.split('/')[4];
    const ok = db.deleteGuest(id);
    return sendJson(res, 200, { success: ok, message: ok ? 'Tamu dihapus' : 'Tamu tidak ditemukan' });
  }

  // API Protected: Admin RSVPs List & Delete
  if (pathname === '/api/admin/rsvps' && method === 'GET') {
    if (!isAuthenticated) {
      return sendJson(res, 401, { success: false, error: 'Akses ditolak.' });
    }
    return sendJson(res, 200, { success: true, data: db.getAllWishes() });
  }

  if (pathname.startsWith('/api/admin/rsvps/') && method === 'DELETE') {
    if (!isAuthenticated) {
      return sendJson(res, 401, { success: false, error: 'Akses ditolak.' });
    }
    const id = pathname.split('/')[4];
    const ok = db.deleteWish(id);
    return sendJson(res, 200, { success: ok, message: ok ? 'RSVP dihapus' : 'RSVP tidak ditemukan' });
  }

  // =========================================================================
  // 3. ROUTE UNDANGAN PERSONAL (/undangan/:slug)
  // =========================================================================
  if (pathname.startsWith('/undangan/') && !pathname.includes('/assets/') && !path.extname(pathname) && method === 'GET') {
    const slug = pathname.replace('/undangan/', '').split('/')[0].trim();
    const guestRecord = db.getGuestBySlug(slug);

    // Tentukan nama tamu: dari database atau dari format slug
    let guestName = 'Tamu Undangan';
    if (guestRecord && guestRecord.name) {
      guestName = guestRecord.name;
    } else if (slug) {
      guestName = decodeURIComponent(slug)
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    const indexFilePath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexFilePath)) {
      let html = fs.readFileSync(indexFilePath, 'utf-8');

      // Pastikan ada <base href="/"> agar seluruh file asset (css, js, gambar)
      // dimuat dengan benar dari root domain pada URL /undangan/:slug
      if (!html.includes('<base href=')) {
        html = html.replace('<head>', '<head>\n  <base href="/">');
      }

      // Inject nama tamu langsung ke Server-Side Rendered HTML
      const scriptInjection = `<script>window.PERSONAL_GUEST_NAME = ${JSON.stringify(guestName)};</script>\n</head>`;
      html = html.replace('</head>', scriptInjection);

      // Ganti teks nama tamu di sampul
      html = html.replace(
        /<div class="cover-guest-name" id="guestName">[^<]*<\/div>/,
        `<div class="cover-guest-name" id="guestName">${escapeHtml(guestName)}</div>`
      );

      // Pre-fill input nama pada form RSVP
      html = html.replace(
        /<input type="text" id="rsvpName" class="form-input" placeholder="Masukkan nama Anda" required>/,
        `<input type="text" id="rsvpName" class="form-input" placeholder="Masukkan nama Anda" value="${escapeHtml(guestName)}" required>`
      );

      return sendHtml(res, 200, html);
    }
  }

  // =========================================================================
  // 4. PUBLIC API ENDPOINTS
  // =========================================================================

  // Health Check
  if (pathname === '/api/health' && method === 'GET') {
    const stats = db.getStats();
    return sendJson(res, 200, {
      success: true,
      status: 'UP',
      database: 'Text DB (db.js)',
      totalWishes: stats.total,
      totalTamuHadir: stats.totalTamuHadir,
      totalGuests: stats.totalGuestsCreated,
      timestamp: new Date().toISOString()
    });
  }

  // GET /api/wishes - Ambil semua ucapan publik
  if (pathname === '/api/wishes' && method === 'GET') {
    try {
      const wishes = db.getAllWishes();
      return sendJson(res, 200, {
        success: true,
        count: wishes.length,
        data: wishes
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: 'Gagal memuat ucapan' });
    }
  }

  // POST /api/wishes - Kirim & simpan ucapan baru ke file text db.js
  if (pathname === '/api/wishes' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      const { name, attendance, guests_count, message } = payload;

      if (!name || !name.trim()) {
        return sendJson(res, 400, { success: false, error: 'Nama lengkap wajib diisi' });
      }
      if (!message || !message.trim()) {
        return sendJson(res, 400, { success: false, error: 'Ucapan doa restu wajib diisi' });
      }

      const savedRecord = db.saveWish({
        name: name.trim(),
        attendance: attendance || 'hadir',
        guests_count: parseInt(guests_count || 1, 10),
        message: message.trim()
      });

      return sendJson(res, 201, {
        success: true,
        message: 'Ucapan berhasil disimpan langsung ke file db.js!',
        data: savedRecord
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message || 'Gagal menyimpan ucapan' });
    }
  }

  // GET /api/stats
  if (pathname === '/api/stats' && method === 'GET') {
    return sendJson(res, 200, { success: true, data: db.getStats() });
  }

  // =========================================================================
  // 5. STATIC FILE SERVING
  // =========================================================================
  let safePath = pathname === '/' ? '/index.html' : pathname;

  // Jika browser meminta asset dari sub-path seperti /undangan/assets/...
  // normalkan path agar mengarah ke folder /assets yang sebenarnya
  if (safePath.includes('/assets/')) {
    safePath = safePath.substring(safePath.indexOf('/assets/'));
  }

  const normalizedPath = path.normalize(safePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, normalizedPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="id">
        <head><meta charset="UTF-8"><title>404 Tidak Ditemukan</title></head>
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>404 - Halaman Tidak Ditemukan</h2>
          <p><a href="/">Kembali ke Undangan</a></p>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };

    if (ext === '.mp3' || ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      headers['Cache-Control'] = 'public, max-age=86400';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  💍 THE WEDDING OF ARBIAN & HIMA - INVITATION SERVER  `);
  console.log(`=======================================================`);
  console.log(`  🚀 Website Undangan : http://localhost:${PORT}`);
  console.log(`  🔐 Login Admin      : http://localhost:${PORT}/login`);
  console.log(`  📊 Admin Dashboard  : http://localhost:${PORT}/admin`);
  console.log(`  💌 Undangan Tamu    : http://localhost:${PORT}/undangan/andi`);
  console.log(`  📝 Database File    : db.js (Format TEXT / JSON)`);
  console.log(`=======================================================`);
});
