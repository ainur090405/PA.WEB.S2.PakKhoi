// models/Model_Reservasi.js
const connection = require('../config/database');
const Model_Jadwal = require('./Model_Jadwal');

// helper Promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

let isUpdating = false;

class Model_Reservasi {

  // CREATE
  static async Store(Data) {
    return runQuery('INSERT INTO reservasi SET ?', [Data]);
  }

  // GET BY USER
  static async getByUser(id_user) {
    const sql = `
      SELECT
        r.*,
        a.nama_arena,
        j.tanggal,
        j.jam_mulai,
        j.jam_selesai,

        p.id_pembayaran,
        p.metode_pembayaran   AS pembayaran_metode,
        p.status_pembayaran   AS pembayaran_status,
        p.status_bukti        AS pembayaran_status_bukti,
        p.bukti_pembayaran    AS pembayaran_bukti,
        p.jumlah              AS pembayaran_jumlah,
        p.tanggal_pembayaran  AS pembayaran_tanggal,
        p.konfirmasi_admin    AS pembayaran_konfirmasi,
        p.catatan_admin       AS pembayaran_catatan

      FROM reservasi r
      JOIN arena a ON r.id_arena = a.id_arena
      JOIN jadwal j ON r.id_jadwal = j.id_jadwal
      LEFT JOIN pembayaran p ON p.id_reservasi = r.id_reservasi
      WHERE r.id_user = ?
      ORDER BY r.tanggal_pesan DESC
    `;
    return runQuery(sql, [id_user]);
  }

  // GET ALL (ADMIN)
  static async getAll() {
    const sql = `
      SELECT
        r.*,
        u.nama              AS nama_user,
        a.nama_arena,
        j.tanggal,
        j.jam_mulai,
        j.jam_selesai,

        p.id_pembayaran,
        p.metode_pembayaran   AS pembayaran_metode,
        p.status_pembayaran   AS pembayaran_status,
        p.status_bukti        AS pembayaran_status_bukti,
        p.bukti_pembayaran    AS pembayaran_bukti,
        p.jumlah              AS pembayaran_jumlah,
        p.tanggal_pembayaran  AS pembayaran_tanggal,
        p.konfirmasi_admin    AS pembayaran_konfirmasi,
        p.catatan_admin       AS pembayaran_catatan

      FROM reservasi r
      JOIN users u   ON r.id_user = u.id_user
      JOIN arena a   ON r.id_arena = a.id_arena
      JOIN jadwal j  ON r.id_jadwal = j.id_jadwal
      LEFT JOIN pembayaran p ON p.id_reservasi = r.id_reservasi
      ORDER BY r.tanggal_pesan DESC
    `;
    return runQuery(sql);
  }

  // GET BY ID
  static async getById(id) {
    const sql = `
      SELECT
        r.*,
        u.nama              AS nama_user,
        a.nama_arena,
        j.tanggal,
        j.jam_mulai,
        j.jam_selesai,

        p.id_pembayaran,
        p.metode_pembayaran   AS pembayaran_metode,
        p.status_pembayaran   AS pembayaran_status,
        p.status_bukti        AS pembayaran_status_bukti,
        p.bukti_pembayaran    AS pembayaran_bukti,
        p.jumlah              AS pembayaran_jumlah,
        p.tanggal_pembayaran  AS pembayaran_tanggal,
        p.konfirmasi_admin    AS pembayaran_konfirmasi,
        p.catatan_admin       AS pembayaran_catatan

      FROM reservasi r
      JOIN users u   ON r.id_user = u.id_user
      JOIN arena a   ON r.id_arena = a.id_arena
      JOIN jadwal j  ON r.id_jadwal = j.id_jadwal
      LEFT JOIN pembayaran p ON p.id_reservasi = r.id_reservasi
      WHERE r.id_reservasi = ?
      LIMIT 1
    `;
    return runQuery(sql, [id]);
  }

  // ==========================
  // AUTO UPDATE STATUS (punya kamu)
  // ==========================
  static async autoUpdateStatus() {
    if (isUpdating) return;
    isUpdating = true;

    try {
      // 1) tandai selesai bila waktu main sudah lewat
      await runQuery(`
        UPDATE reservasi r
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        SET r.status = 'selesai'
        WHERE r.status IN ('disetujui','menunggu')
          AND CONCAT(j.tanggal, ' ', j.jam_selesai) < NOW()
      `);

      // 2) menunggu > 20 menit → slot dibuka lagi (status booking)
      await runQuery(`
        UPDATE reservasi r
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        SET r.status = 'booking',
            j.status_slot = 'kosong'
        WHERE r.status = 'menunggu'
          AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20
      `);

      // 3) ditolak > 20 menit → free slot juga
      await runQuery(`
        UPDATE reservasi r
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        SET r.status = 'booking',
            j.status_slot = 'kosong'
        WHERE r.status = 'ditolak'
          AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20
      `);

      console.log('AUTO UPDATE OK');
    } catch (err) {
      console.error('AUTO UPDATE ERROR:', err);
    }

    isUpdating = false;
  }

  static isBusy() {
    return isUpdating;
  }

  // reject + free slot
  static async rejectAndFreeSlot(id_reservasi) {
    const sql = `
      UPDATE reservasi r
      JOIN jadwal j ON r.id_jadwal = j.id_jadwal
      SET r.status = 'ditolak',
          j.status_slot = 'kosong'
      WHERE r.id_reservasi = ?
    `;
    return runQuery(sql, [id_reservasi]);
  }

  // UPDATE & DELETE
  static async Update(id, data) {
    return runQuery('UPDATE reservasi SET ? WHERE id_reservasi = ?', [data, id]);
  }

  static async Delete(id) {
    return runQuery('DELETE FROM reservasi WHERE id_reservasi = ?', [id]);
  }
}

module.exports = Model_Reservasi;
