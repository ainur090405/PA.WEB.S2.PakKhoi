// models/Model_Arena.js
const connection = require('../config/database');

// helper query pakai Promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

class Model_Arena {

  // Ambil semua arena (untuk admin) + cover
  static async getAll() {
    const sql = `
      SELECT a.*, f.url_foto AS foto_cover 
      FROM arena a
      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
      ORDER BY a.id_arena DESC
    `;
    return runQuery(sql);
  }

  // Ambil 1 arena (detail) + cover + rata-rata rating
  static async getById(id) {
    const sql = `
      SELECT 
        a.*,
        f.url_foto AS foto_cover,
        COALESCE(ur.avg_rating, 0)   AS avg_rating,
        COALESCE(ur.total_review, 0) AS total_review
      FROM arena a
      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
      LEFT JOIN (
        SELECT 
          r.id_arena,
          AVG(u.rating)  AS avg_rating,
          COUNT(*)       AS total_review
        FROM ulasan u
        JOIN reservasi r ON u.id_reservasi = r.id_reservasi
        GROUP BY r.id_arena
      ) ur ON ur.id_arena = a.id_arena
      WHERE a.id_arena = ?
    `;
    return runQuery(sql, [id]);
  }

  // Ambil arena untuk publik (/venues) + cover + rating
  static async getPublic(filter) {
    let params = [];
    let sql = `
      SELECT 
        a.*,
        f.url_foto AS foto_cover,
        COALESCE(ur.avg_rating, 0)   AS avg_rating,
        COALESCE(ur.total_review, 0) AS total_review
      FROM arena a
      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
      LEFT JOIN (
        SELECT 
          r.id_arena,
          AVG(u.rating)  AS avg_rating,
          COUNT(*)       AS total_review
        FROM ulasan u
        JOIN reservasi r ON u.id_reservasi = r.id_reservasi
        GROUP BY r.id_arena
      ) ur ON ur.id_arena = a.id_arena
      WHERE a.status = 'aktif'
    `;

    if (filter.lokasi) {
      sql += ' AND a.lokasi LIKE ?';
      params.push('%' + filter.lokasi + '%');
    }
    if (filter.jenis) {
      sql += ' AND a.jenis_olahraga = ?';
      params.push(filter.jenis);
    }

    sql += ' ORDER BY a.nama_arena ASC';

    return runQuery(sql, params);
  }

  // Ambil arena untuk Home (rekomendasi) + cover + rating
  static async getFeatured() {
    const sql = `
      SELECT 
        a.*,
        f.url_foto AS foto_cover,
        COALESCE(ur.avg_rating, 0)   AS avg_rating,
        COALESCE(ur.total_review, 0) AS total_review
      FROM arena a 
      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
      LEFT JOIN (
        SELECT 
          r.id_arena,
          AVG(u.rating)  AS avg_rating,
          COUNT(*)       AS total_review
        FROM ulasan u
        JOIN reservasi r ON u.id_reservasi = r.id_reservasi
        GROUP BY r.id_arena
      ) ur ON ur.id_arena = a.id_arena
      WHERE a.status = 'aktif' 
        AND a.id_foto_cover IS NOT NULL
      ORDER BY ur.avg_rating DESC, ur.total_review DESC, a.id_arena DESC
      LIMIT 3
    `;
    return runQuery(sql);
  }

  // Jenis olahraga unik (filter di /venues)
  static async getJenisOlahragaList() {
    const sql = `
      SELECT DISTINCT jenis_olahraga 
      FROM arena 
      WHERE status = 'aktif' AND jenis_olahraga IS NOT NULL 
      ORDER BY jenis_olahraga ASC
    `;
    return runQuery(sql);
  }

  // Arena teratas berdasarkan rating (buat statistik / rekomendasi khusus)
  static async getTopWithRating(limit = 3) {
    const sql = `
      SELECT 
        a.*,
        f.url_foto AS foto_cover,
        COALESCE(AVG(u.rating), 0) AS avg_rating,
        COUNT(u.id_ulasan)         AS total_ulasan
      FROM arena a
      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
      LEFT JOIN reservasi r ON r.id_arena = a.id_arena
      LEFT JOIN ulasan u     ON u.id_reservasi = r.id_reservasi
      WHERE a.status = 'aktif'
      GROUP BY a.id_arena
      ORDER BY avg_rating DESC, total_ulasan DESC, a.id_arena DESC
      LIMIT ?
    `;
    return runQuery(sql, [Number(limit) || 3]);
  }

  // Set foto cover
  static async setCover(id_arena, id_foto) {
    const sql = 'UPDATE arena SET id_foto_cover = ? WHERE id_arena = ?';
    return runQuery(sql, [id_foto, id_arena]);
  }
  
  // --- CRUD standar ---
  static async Store(Data) {
    const sql = 'INSERT INTO arena SET ?';
    return runQuery(sql, [Data]);
  }

  static async Update(id, Data) {
    const sql = 'UPDATE arena SET ? WHERE id_arena = ?';
    return runQuery(sql, [Data, id]);
  }

  static async Delete(id) {
    const sql = 'DELETE FROM arena WHERE id_arena = ?';
    return runQuery(sql, [id]);
  }
}

module.exports = Model_Arena;
