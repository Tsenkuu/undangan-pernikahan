/**
 * ============================================================================
 * DATABASE UTAMA (db.js) - The Wedding of Arbian & Hima
 * ============================================================================
 * Database berbasis Text / JSON tanpa SQLite.
 * Menyimpan data Ucapan / RSVP dan Daftar Tamu Undangan Personal.
 * Data di bawah ini dapat dibaca, disalin, atau diedit langsung sebagai text.
 */

/* DATA_START */
let DATA_UCAPAN = [];
/* DATA_END */

/* GUESTS_START */
let DATA_TAMU_UNDANGAN = [
  {
    "id": 7,
    "name": "Andi & Partner",
    "slug": "andi-partner-3",
    "created_at": "2026-11-09T14:45:31.801Z"
  },
  {
    "id": 6,
    "name": "bambang",
    "slug": "bambang",
    "created_at": "2026-11-09T14:36:19.020Z"
  },
  {
    "id": 5,
    "name": "Andi & Partner",
    "slug": "andi-partner-2",
    "created_at": "2026-11-09T14:26:13.357Z"
  },
  {
    "id": 4,
    "name": "Andi & Partner",
    "slug": "andi-partner",
    "created_at": "2026-11-09T14:25:37.380Z"
  },
  {
    "id": 1,
    "name": "Andi",
    "slug": "andi",
    "created_at": "2026-11-09T08:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Bapak Joko Sekeluarga",
    "slug": "bapak-joko-sekeluarga",
    "created_at": "2026-11-09T08:30:00.000Z"
  },
  {
    "id": 3,
    "name": "Himaaa",
    "slug": "himaaa",
    "created_at": "2026-11-09T09:00:00.000Z"
  }
];
/* GUESTS_END */

// Konfigurasi Kredensial Admin (Password terenkripsi Scrypt Hash)
const ADMIN_CONFIG = {
  username: 'imaa',
  salt: '53a06d24c593a35851addc79eb58514b',
  passwordHash: 'f1f17b568839be61457041b56e107b6840c89a3d823cf0523ce93777fc3241e4e59f6fdb3dbd2b26145cf7398bdac2c1a026790a209dab7156a258e05d0f2dd1'
};

// ============================================================================
// FUNGSI PERSISTENSI KE FILE TEXT
// ============================================================================
function persistToTextFile() {
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
    return;
  }
  try {
    const fs = require('node:fs');
    const path = require('node:path');

    const formattedWishes = JSON.stringify(DATA_UCAPAN, null, 2);
    const regexWishes = /\/\* DATA_START \*\/[\s\S]*?\/\* DATA_END \*\//;
    const replacementWishes = `/* DATA_START */\nlet DATA_UCAPAN = ${formattedWishes};\n/* DATA_END */`;

    const formattedGuests = JSON.stringify(DATA_TAMU_UNDANGAN, null, 2);
    const regexGuests = /\/\* GUESTS_START \*\/[\s\S]*?\/\* GUESTS_END \*\//;
    const replacementGuests = `/* GUESTS_START */\nlet DATA_TAMU_UNDANGAN = ${formattedGuests};\n/* GUESTS_END */`;

    const updateFile = (filePath) => {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        if (regexWishes.test(content)) {
          content = content.replace(regexWishes, replacementWishes);
        }
        if (regexGuests.test(content)) {
          content = content.replace(regexGuests, replacementGuests);
        }
        fs.writeFileSync(filePath, content, 'utf-8');
      }
    };

    updateFile(path.resolve(__dirname, 'db.js'));
    updateFile(path.resolve(__dirname, 'assets', 'js', 'db.js'));

    console.log(`[db.js] Data ucapan (${DATA_UCAPAN.length}) dan tamu (${DATA_TAMU_UNDANGAN.length}) berhasil disimpan ke file text.`);
  } catch (err) {
    console.warn('[db.js] Gagal menyimpan ke file text:', err.message);
  }
}

// Helper untuk membuat slug unik ramah URL
function createUniqueSlug(name) {
  let baseSlug = name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  if (!baseSlug) baseSlug = 'tamu';

  let slug = baseSlug;
  let counter = 2;
  const existingSlugs = new Set(DATA_TAMU_UNDANGAN.map(g => g.slug));

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ============================================================================
// API DATABASE
// ============================================================================
const db = {
  type: 'Text/JSON Database (db.js)',

  // --- Fitur RSVP & Ucapan ---
  getAllWishes() {
    return [...DATA_UCAPAN];
  },

  saveWish({ name, attendance = 'hadir', guests_count = 1, message }) {
    if (!name || !name.trim()) {
      throw new Error('Nama lengkap wajib diisi');
    }
    if (!message || !message.trim()) {
      throw new Error('Ucapan doa restu wajib diisi');
    }

    const nextId = DATA_UCAPAN.length > 0 
      ? Math.max(...DATA_UCAPAN.map(item => Number(item.id) || 0)) + 1 
      : 1;

    const newRecord = {
      id: nextId,
      name: name.trim(),
      attendance: attendance,
      guests_count: parseInt(guests_count || 1, 10),
      message: message.trim(),
      created_at: new Date().toISOString(),
      time: 'Baru saja'
    };

    DATA_UCAPAN.unshift(newRecord);
    persistToTextFile();
    return newRecord;
  },

  deleteWish(id) {
    const initialLength = DATA_UCAPAN.length;
    DATA_UCAPAN = DATA_UCAPAN.filter(item => Number(item.id) !== Number(id));
    if (DATA_UCAPAN.length !== initialLength) {
      persistToTextFile();
      return true;
    }
    return false;
  },

  getStats() {
    let hadir = 0;
    let tidak = 0;
    let ragu = 0;
    let totalTamuHadir = 0;

    DATA_UCAPAN.forEach(item => {
      if (item.attendance === 'hadir') {
        hadir += 1;
        totalTamuHadir += parseInt(item.guests_count || 1, 10);
      } else if (item.attendance === 'tidak') {
        tidak += 1;
      } else {
        ragu += 1;
      }
    });

    return {
      total: DATA_UCAPAN.length,
      hadir,
      tidak,
      ragu,
      totalTamuHadir,
      totalGuestsCreated: DATA_TAMU_UNDANGAN.length
    };
  },

  // --- Fitur Tamu Undangan Personal ---
  getAllGuests() {
    return [...DATA_TAMU_UNDANGAN];
  },

  addGuest(name) {
    if (!name || !name.trim()) {
      throw new Error('Nama tamu wajib diisi');
    }

    const cleanName = name.trim();
    const nextId = DATA_TAMU_UNDANGAN.length > 0 
      ? Math.max(...DATA_TAMU_UNDANGAN.map(g => Number(g.id) || 0)) + 1 
      : 1;

    const slug = createUniqueSlug(cleanName);

    const newGuest = {
      id: nextId,
      name: cleanName,
      slug: slug,
      created_at: new Date().toISOString()
    };

    DATA_TAMU_UNDANGAN.unshift(newGuest);
    persistToTextFile();
    return newGuest;
  },

  getGuestBySlug(slug) {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().trim();
    return DATA_TAMU_UNDANGAN.find(g => g.slug.toLowerCase() === cleanSlug) || null;
  },

  deleteGuest(id) {
    const initialLength = DATA_TAMU_UNDANGAN.length;
    DATA_TAMU_UNDANGAN = DATA_TAMU_UNDANGAN.filter(item => Number(item.id) !== Number(id));
    if (DATA_TAMU_UNDANGAN.length !== initialLength) {
      persistToTextFile();
      return true;
    }
    return false;
  },

  // --- Fitur Autentikasi Admin ---
  verifyAdmin(username, password) {
    if (username !== ADMIN_CONFIG.username) return false;
    try {
      const crypto = require('node:crypto');
      const hash = crypto.scryptSync(password, ADMIN_CONFIG.salt, 64).toString('hex');
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(ADMIN_CONFIG.passwordHash, 'hex'));
    } catch (e) {
      return false;
    }
  }
};

// Export untuk lingkungan Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = db;
}

// Daftarkan ke window jika dijalankan di browser
if (typeof window !== 'undefined') {
  window.DATA_UCAPAN = DATA_UCAPAN;
  window.DATA_TAMU_UNDANGAN = DATA_TAMU_UNDANGAN;
  window.db = db;
}
