// models/Model_Arena.js
const connection = require('../config/database');

class Model_Arena {

  // FUNGSI UPDATE: Ambil semua arena (termasuk foto cover)
  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT a.*, f.url_foto AS foto_cover 
        FROM arena a
        LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
        ORDER BY a.id_arena DESC
      `;
      connection.query(sql, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }

  // FUNGSI UPDATE: Ambil 1 arena (termasuk foto cover)
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT a.*, f.url_foto AS foto_cover
        FROM arena a
        LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
        WHERE a.id_arena = ?
      `;
      connection.query(sql, [id], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }

  // FUNGSI UPDATE: Ambil arena untuk publik (termasuk foto cover)
  static async getPublic(filter) {
    return new Promise((resolve, reject) => {
      let params = [];
      let sql = `
        SELECT a.*, f.url_foto AS foto_cover 
        FROM arena a
        LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
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

      connection.query(sql, params, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }

  // FUNGSI UPDATE: Ambil arena untuk Home (termasuk foto cover)
  static async getFeatured() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT a.*, f.url_foto AS foto_cover
        FROM arena a 
        LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto
        WHERE a.status = 'aktif' AND a.id_foto_cover IS NOT NULL
        LIMIT 3
      `;
      connection.query(sql, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }

  // FUNGSI UPDATE: Ambil jenis olahraga unik (tidak berubah, tapi penting)
  static async getJenisOlahragaList() {
     return new Promise((resolve, reject) => {
      const sql = `
        SELECT DISTINCT jenis_olahraga 
        FROM arena 
        WHERE status = 'aktif' AND jenis_olahraga IS NOT NULL 
        ORDER BY jenis_olahraga ASC
      `;
      connection.query(sql, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }

  // FUNGSI BARU: Untuk set foto cover
  static async setCover(id_arena, id_foto) {
     return new Promise((resolve, reject) => {
      connection.query('UPDATE arena SET id_foto_cover = ? WHERE id_arena = ?', [id_foto, id_arena], (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }
  
  // --- Fungsi CRUD (tidak berubah) ---
  static async Store(Data) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO arena SET ?', Data, (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }

  static async Update(id, Data) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE arena SET ? WHERE id_arena = ?', [Data, id], (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }

  static async Delete(id) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM arena WHERE id_arena = ?', [id], (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }
}

module.exports = Model_Arena;