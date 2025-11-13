const connection = require('../config/database');
const Model_Jadwal = require('./Model_Jadwal');

// ✅ Tambahkan flag di luar class (biar tetap sama di semua pemanggilan)
let isUpdating = false;

class Model_Reservasi {

  static async Store(Data) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO reservasi SET ?', Data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getByUser(id_user) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          r.id_reservasi,
          r.status,
          r.tanggal_pesan,
          r.payment_method,
          r.amount,
          a.nama_arena,
          j.tanggal,
          j.jam_mulai,
          j.jam_selesai,
          CASE 
            WHEN u.id_ulasan IS NOT NULL THEN 1 
            ELSE 0 
          END AS sudah_ulasan
        FROM reservasi r
        JOIN arena a ON r.id_arena = a.id_arena
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        LEFT JOIN ulasan u ON r.id_reservasi = u.id_reservasi
        WHERE r.id_user = ?
        ORDER BY r.tanggal_pesan DESC
      `;
      connection.query(sql, [id_user], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, u.nama AS nama_user, a.nama_arena, j.tanggal, j.jam_mulai
        FROM reservasi r
        JOIN users u ON r.id_user = u.id_user
        JOIN arena a ON r.id_arena = a.id_arena
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        ORDER BY r.tanggal_pesan DESC
      `;
      connection.query(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, u.nama AS nama_user, a.nama_arena, j.tanggal, j.jam_mulai
        FROM reservasi r
        JOIN users u ON r.id_user = u.id_user
        JOIN arena a ON r.id_arena = a.id_arena
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        WHERE r.id_reservasi = ?
      `;
      connection.query(sql, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

static async autoUpdateStatus() {
  if (isUpdating) {
    console.log("⏳ Skip auto update, server sedang sibuk.");
    return;
  }

  isUpdating = true;
  try {
    const sql = `
      -- 1️⃣ Ubah ke 'selesai' jika waktu main sudah lewat
      UPDATE reservasi r
      JOIN jadwal j ON r.id_jadwal = j.id_jadwal
      SET r.status = 'selesai'
      WHERE r.status IN ('disetujui', 'menunggu')
        AND CONCAT(j.tanggal, ' ', j.jam_selesai) < NOW();

      -- 2️⃣ Jika status 'menunggu' lebih dari 20 menit → ubah jadi 'booking' + kosongkan slot
      UPDATE reservasi r
      JOIN jadwal j ON r.id_jadwal = j.id_jadwal
      SET 
        r.status = 'booking',
        j.status_slot = 'kosong'
      WHERE r.status = 'menunggu'
        AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20;

      -- 3️⃣ Jika status 'ditolak' lebih dari 20 menit → ubah jadi 'booking' + kosongkan slot
      UPDATE reservasi r
      JOIN jadwal j ON r.id_jadwal = j.id_jadwal
      SET 
        r.status = 'booking',
        j.status_slot = 'kosong'
      WHERE r.status = 'ditolak'
        AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20;
    `;

    await new Promise((resolve, reject) => {
      connection.query(sql, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log(`[AUTO] Status reservasi & jadwal diperbarui otomatis: ${new Date().toLocaleString()}`);
  } catch (err) {
    console.error('❌ Gagal auto update status:', err);
  } finally {
    isUpdating = false;
  }
}

  static isBusy() {
    return isUpdating;
  }

static async rejectAndFreeSlot(id_reservasi) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE reservasi r
      JOIN jadwal j ON r.id_jadwal = j.id_jadwal
      SET 
        r.status = 'ditolak',
        j.status_slot = 'kosong'
      WHERE r.id_reservasi = ?;
    `;
    connection.query(sql, [id_reservasi], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


  static async Update(id, Data) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE reservasi SET ? WHERE id_reservasi = ?', [Data, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async Delete(id) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM reservasi WHERE id_reservasi = ?', [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Model_Reservasi;
