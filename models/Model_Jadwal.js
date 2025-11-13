// models/Model_Jadwal.js
const connection = require('../config/database');

class Model_Jadwal {

  // FUNGSI BARU: Ambil semua jadwal (JOIN dengan arena)
  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT j.*, a.nama_arena 
        FROM jadwal j
        JOIN arena a ON j.id_arena = a.id_arena
        ORDER BY j.tanggal DESC, j.jam_mulai ASC
      `;
      connection.query(sql, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }
static async getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT j.*, a.nama_arena, a.jam_buka, a.jam_tutup 
        FROM jadwal j
        JOIN arena a ON j.id_arena = a.id_arena
        WHERE j.id_jadwal = ?
      `;
      connection.query(sql, [id], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }
  // FUNGSI BARU: Ambil semua jadwal masa depan untuk 1 arena (termasuk yang sudah terisi, untuk tampilan)
  static async getAvailableByArenaId(id_arena) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM jadwal
        WHERE id_arena = ?
          AND (
            tanggal > CURDATE()  -- Hari mendatang
            OR (tanggal = CURDATE() AND jam_mulai > CURTIME())  -- Hari ini tapi jam belum lewat
          )
        ORDER BY tanggal ASC, jam_mulai ASC
      `;
      connection.query(sql, [id_arena], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }
  // FUNGSI BARU UNTUK GENERATOR
  static async StoreMany(sesiData) {
    return new Promise((resolve, reject) => {
      // 1. Ubah array of objects [{}, {}] menjadi array of arrays [[], []]
      const values = sesiData.map(sesi => [
        sesi.id_arena,
        sesi.tanggal,
        sesi.jam_mulai,
        sesi.jam_selesai,
        sesi.status_slot
      ]);

      // 2. Query SQL untuk bulk insert (menyimpan banyak data sekaligus)
      const sql = 'INSERT INTO jadwal (id_arena, tanggal, jam_mulai, jam_selesai, status_slot) VALUES ?';
      
      connection.query(sql, [values], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
  // FUNGSI BARU: Simpan jadwal baru
  static async Store(Data) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO jadwal SET ?', Data, (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }
static async Update(id_jadwal, data) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE jadwal SET ? WHERE id_jadwal = ?';
    connection.query(sql, [data, id_jadwal], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


  // FUNGSI BARU: Hapus jadwal
  static async Delete(id) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM jadwal WHERE id_jadwal = ?', [id], (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }
}

module.exports = Model_Jadwal;