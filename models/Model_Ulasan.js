// models/Model_Ulasan.js
const connection = require('../config/database');

class Model_Ulasan {

  static async getByUser(id_user) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT u.rating, u.komentar, u.tanggal_ulasan, a.nama_arena
        FROM ulasan u
        JOIN reservasi r ON u.id_reservasi = r.id_reservasi
        JOIN arena a ON r.id_arena = a.id_arena
        WHERE u.id_user = ?
        ORDER BY u.tanggal_ulasan DESC
      `;
      connection.query(sql, [id_user], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM ulasan', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM ulasan WHERE id_ulasan = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ✅ tambahan fix: get ulasan berdasarkan id_reservasi
  static async getByReservasi(id_reservasi) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM ulasan WHERE id_reservasi = ?', [id_reservasi], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async Store(Data) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO ulasan SET ?', Data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async Update(id_reservasi, Data) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE ulasan SET ? WHERE id_reservasi = ?', [Data, id_reservasi], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async Delete(id_reservasi) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM ulasan WHERE id_reservasi = ?', [id_reservasi], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getByArena(id_arena) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT u.rating, u.komentar, u.tanggal_ulasan, usr.nama as nama_user
        FROM ulasan u
        JOIN reservasi r ON u.id_reservasi = r.id_reservasi
        JOIN users usr ON u.id_user = usr.id_user
        WHERE r.id_arena = ?
        ORDER BY u.tanggal_ulasan DESC
      `;
      connection.query(sql, [id_arena], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
static async UpdateByReservasi(id_reservasi, Data) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE ulasan SET ? WHERE id_reservasi = ?';
    connection.query(sql, [Data, id_reservasi], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

  static async getAverageRating(id_arena) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT AVG(u.rating) as avg_rating, COUNT(u.id_ulasan) as total_reviews
        FROM ulasan u
        JOIN reservasi r ON u.id_reservasi = r.id_reservasi
        WHERE r.id_arena = ?
      `;
      connection.query(sql, [id_arena], (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });
  }
}

module.exports = Model_Ulasan;
