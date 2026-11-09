/**
 * ============================================================================
 * DATABASE UCAPAN & DOA (assets/js/db.js) - The Wedding of Arbian & Hima
 * ============================================================================
 * Database berbasis Text / JSON (Bukan SQLite).
 * Data ucapan dan tamu tersimpan langsung di dalam file ini dalam bentuk text.
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

(function (global) {
  'use strict';

  const STORAGE_KEY = 'wedding_wishes_text_db';

  function formatRelativeTime(dateInput) {
    if (!dateInput) return 'Baru saja';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  class WeddingTextDatabase {
    constructor() {
      this.listeners = [];
      this.activeEngine = 'Text Database (db.js)';
      this.isServerConnected = false;
    }

    async init() {
      if (typeof window !== 'undefined' && window.location.protocol !== 'file:') {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1200);
          const res = await fetch('/api/health', { signal: controller.signal });
          clearTimeout(timer);
          if (res.ok) {
            this.isServerConnected = true;
            this.activeEngine = 'Server Text Database (db.js)';
            return;
          }
        } catch (e) {
          this.isServerConnected = false;
        }
      }

      this.activeEngine = 'Local Text Database (db.js)';
    }

    async getWishes() {
      if (this.isServerConnected) {
        try {
          const res = await fetch('/api/wishes');
          if (res.ok) {
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
              return json.data.map(item => ({
                ...item,
                time: item.time || formatRelativeTime(item.created_at)
              }));
            }
          }
        } catch (e) {
          console.warn('[db.js] Server fetch gagal, fallback lokal:', e);
        }
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(item => ({
              ...item,
              time: item.time || formatRelativeTime(item.created_at)
            }));
          }
        }
      } catch (e) {}

      return DATA_UCAPAN.map(item => ({
        ...item,
        time: item.time || formatRelativeTime(item.created_at)
      }));
    }

    async saveWish(wishData) {
      const name = (wishData.name || '').trim();
      const attendance = wishData.attendance || 'hadir';
      const guests_count = parseInt(wishData.guests_count || 1, 10);
      const message = (wishData.message || '').trim();

      if (!name || !message) {
        throw new Error('Nama dan ucapan wajib diisi');
      }

      let savedRecord = null;

      if (this.isServerConnected) {
        try {
          const res = await fetch('/api/wishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, attendance, guests_count, message })
          });
          if (res.ok) {
            const json = await res.json();
            savedRecord = json.data;
          }
        } catch (err) {
          console.warn('[db.js] Server post gagal, simpan ke lokal:', err);
        }
      }

      if (!savedRecord) {
        const nextId = DATA_UCAPAN.length > 0
          ? Math.max(...DATA_UCAPAN.map(w => Number(w.id) || 0)) + 1
          : 1;

        savedRecord = {
          id: nextId,
          name,
          attendance,
          guests_count,
          message,
          created_at: new Date().toISOString(),
          time: 'Baru saja'
        };
      }

      DATA_UCAPAN.unshift(savedRecord);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA_UCAPAN));
      } catch (e) {}

      this._notifyListeners(savedRecord);
      return savedRecord;
    }

    onWishAdded(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
    }

    _notifyListeners(wish) {
      this.listeners.forEach(cb => {
        try { cb(wish); } catch (e) {}
      });
    }
  }

  const WeddingDB = new WeddingTextDatabase();

  if (typeof window !== 'undefined') {
    window.WeddingDB = WeddingDB;
    window.db = WeddingDB;
    window.DATA_UCAPAN = DATA_UCAPAN;
    window.DATA_TAMU_UNDANGAN = DATA_TAMU_UNDANGAN;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeddingDB;
  }

})(typeof window !== 'undefined' ? window : globalThis);
