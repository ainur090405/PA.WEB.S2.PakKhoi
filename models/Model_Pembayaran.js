// models/Model_Pembayaran.js
const connection = require('../config/database');

// tambahan untuk notifikasi + log auto reject
const Model_Notifikasi = require('./Model_Notifikasi');
const Model_Reservasi = require('./Model_Reservasi');
const Model_Jadwal = require('./Model_Jadwal');
const { createLog } = require('../helpers/logHelper');

// helper kecil biar query pakai Promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

class Model_Pembayaran {
  // ========================
  // BASIC GET / CRUD
  // ========================

  // Ambil semua pembayaran (untuk admin, join user & arena)
  static async getAllWithUserArena() {
    const sql = `
      SELECT 
        p.*,
        r.status AS status_reservasi,
        u.nama AS nama_user,
        a.nama_arena
      FROM pembayaran p
      JOIN reservasi r ON p.id_reservasi = r.id_reservasi
      JOIN users u ON r.id_user = u.id_user
      JOIN arena a ON r.id_arena = a.id_arena
      ORDER BY p.tanggal_pembayaran DESC
    `;
    return runQuery(sql);
  }

  static async getById(id_pembayaran) {
    return runQuery(
      'SELECT * FROM pembayaran WHERE id_pembayaran = ?',
      [id_pembayaran]
    );
  }

  // Ambil 1 pembayaran berdasarkan reservasi
  static async getByReservasi(id_reservasi) {
    return runQuery(
      'SELECT * FROM pembayaran WHERE id_reservasi = ? LIMIT 1',
      [id_reservasi]
    );
  }

  static async Store(data) {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO pembayaran SET ?',
        data,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  static async Update(id_pembayaran, data) {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE pembayaran SET ? WHERE id_pembayaran = ?',
        [data, id_pembayaran],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  static async Delete(id_pembayaran) {
    return new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM pembayaran WHERE id_pembayaran = ?',
        [id_pembayaran],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  // ========================
  // LOGIKA COD
  // ========================

  // Dipakai saat user pilih COD
  static async createCODByReservasi(id_reservasi, jumlah) {
    const data = {
      id_reservasi,
      metode_pembayaran: 'cod',      // enum('cod','transaksi')
      status_pembayaran: 'unpaid',   // default di DB juga 'unpaid'
      jumlah,
      status_bukti: 'pending',
      konfirmasi_admin: false,
      tanggal_pembayaran: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
    return this.Store(data);
  }

  // ========================
  // LOGIKA TRANSFER (UPLOAD BUKTI)
  // ========================

  // Dipanggil ketika user upload bukti transfer
  static async uploadBuktiByReservasi(id_reservasi, filename) {
    return new Promise((resolve, reject) => {
      const update = {
        bukti_pembayaran: filename,
        status_bukti: 'uploaded',           // enum('pending','uploaded')
        status_pembayaran: 'pending',       // enum di tabel, kita pakai 'pending'
        tanggal_pembayaran: new Date(),
        konfirmasi_admin: false,
        updated_at: new Date()
      };

      connection.query(
        'UPDATE pembayaran SET ? WHERE id_reservasi = ?',
        [update, id_reservasi],
        (err, result) => {
          if (err) return reject(err);

          if (result.affectedRows === 0) {
            // belum ada pembayaran → buat baru
            const insert = {
              id_reservasi,
              metode_pembayaran: 'transaksi',
              status_pembayaran: 'pending',
              status_bukti: 'uploaded',
              bukti_pembayaran: filename,
              jumlah: 0,
              konfirmasi_admin: false,
              tanggal_pembayaran: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            };
            connection.query(
              'INSERT INTO pembayaran SET ?',
              insert,
              (err2, res2) => {
                if (err2) return reject(err2);
                resolve(res2);
              }
            );
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  // ========================
  // KONFIRMASI ADMIN
  // ========================

  static async confirmPaymentByReservasi(
    id_reservasi,
    status,
    catatan_admin = null
  ) {
    return new Promise((resolve, reject) => {
      const data = {
        status_pembayaran: status,
        status_bukti:
          status === 'confirmed' || status === 'paid'
            ? 'uploaded'
            : undefined,
        konfirmasi_admin: true,
        catatan_admin,
        updated_at: new Date()
      };

      connection.query(
        'UPDATE pembayaran SET ? WHERE id_reservasi = ?',
        [data, id_reservasi],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  // Pembayaran yang status_pembayaran masih 'pending' → untuk list verifikasi admin
  static async getPendingPayments() {
    const sql = `
      SELECT 
        p.*,
        r.status AS status_reservasi,
        u.nama AS nama_user,
        a.nama_arena
      FROM pembayaran p
      JOIN reservasi r ON p.id_reservasi = r.id_reservasi
      JOIN users u ON r.id_user = u.id_user
      JOIN arena a ON r.id_arena = a.id_arena
      WHERE p.status_pembayaran = 'pending'
      ORDER BY p.tanggal_pembayaran ASC
    `;
    return runQuery(sql);
  }

// =====================================================
// AUTO REJECT 1: tidak upload bukti 20 menit (transaksi)
// =====================================================
static async autoRejectNoProof() {
  const rows = await runQuery(
    `
      SELECT
        p.id_pembayaran,
        p.id_reservasi,
        p.status_pembayaran,
        p.bukti_pembayaran,
        r.id_user,
        r.id_jadwal,
        a.nama_arena,          -- ⬅ ambil dari tabel arena
        r.status       AS status_reservasi,
        r.tanggal_pesan
      FROM pembayaran p
      JOIN reservasi r ON p.id_reservasi = r.id_reservasi
      JOIN arena a     ON r.id_arena     = a.id_arena
      WHERE p.metode_pembayaran = 'transaksi'
        AND (p.bukti_pembayaran IS NULL OR p.bukti_pembayaran = '')
        AND p.status_pembayaran IN ('unpaid','pending')
        AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20
    `
  );

  if (!rows.length) return 0;

  const catatanDefault =
    'Pembayaran ditolak (waktu upload bukti 20 menit habis).';

  for (const row of rows) {
    await runQuery(
      `
        UPDATE pembayaran p
        JOIN reservasi r ON p.id_reservasi = r.id_reservasi
        JOIN jadwal j    ON r.id_jadwal    = j.id_jadwal
        SET
          p.status_pembayaran = 'rejected',
          p.catatan_admin = COALESCE(p.catatan_admin, ?),
          p.updated_at = NOW(),
          r.status = 'ditolak',
          j.status_slot = 'kosong'
        WHERE p.id_pembayaran = ?
      `,
      [catatanDefault, row.id_pembayaran]
    );

    try {
      await createLog(
        row.id_reservasi,
        row.status_reservasi || 'menunggu',
        'ditolak',
        'Pembayaran otomatis ditolak karena batas waktu upload bukti (20 menit) telah habis.'
      );
    } catch (e) {
      console.warn('Gagal buat log autoRejectNoProof:', e);
    }

    try {
      if (row.id_user) {
        await Model_Notifikasi.Store({
          id_user: row.id_user,
          judul: 'Pembayaran Ditolak (Waktu Upload Habis)',
          isi_pesan: `Pembayaran Anda untuk arena ${
            row.nama_arena || 'Arena'
          } ditolak karena batas waktu upload bukti (20 menit) telah habis dan data pembayaran tidak lengkap.`,
          jenis_notif: 'status',
          tipe: 'payment',
          dibaca: 0
        });
      }
    } catch (e) {
      console.warn('Gagal kirim notif autoRejectNoProof:', e);
    }
  }

  return rows.length;
}

// =====================================================
// AUTO REJECT 2: sudah upload, admin tidak konfirmasi 20 menit
// =====================================================
static async autoRejectLateConfirmed() {
  const rows = await runQuery(
    `
      SELECT
        p.id_pembayaran,
        p.id_reservasi,
        p.status_pembayaran,
        p.bukti_pembayaran,
        p.updated_at,
        r.id_user,
        r.id_jadwal,
        a.nama_arena,         -- ⬅ ambil dari tabel arena
        r.status AS status_reservasi
      FROM pembayaran p
      JOIN reservasi r ON p.id_reservasi = r.id_reservasi
      JOIN arena a     ON r.id_arena     = a.id_arena
      WHERE p.metode_pembayaran = 'transaksi'
        AND p.bukti_pembayaran IS NOT NULL
        AND p.status_pembayaran IN ('unpaid','pending')
        AND TIMESTAMPDIFF(MINUTE, p.updated_at, NOW()) >= 20
    `
  );

  if (!rows.length) return 0;

  const catatanDefault =
    'Pembayaran ditolak karena admin tidak mengkonfirmasi dalam batas waktu 20 menit.';

  for (const row of rows) {
    await runQuery(
      `
        UPDATE pembayaran p
        JOIN reservasi r ON p.id_reservasi = r.id_reservasi
        JOIN jadwal j    ON r.id_jadwal    = j.id_jadwal
        SET
          p.status_pembayaran = 'rejected',
          p.catatan_admin = COALESCE(p.catatan_admin, ?),
          p.updated_at = NOW(),
          r.status = 'ditolak',
          j.status_slot = 'kosong'
        WHERE p.id_pembayaran = ?
      `,
      [catatanDefault, row.id_pembayaran]
    );

    try {
      await createLog(
        row.id_reservasi,
        row.status_reservasi || 'menunggu',
        'ditolak',
        'Pembayaran otomatis ditolak karena tidak dikonfirmasi admin dalam 20 menit.'
      );
    } catch (e) {
      console.warn('Gagal buat log autoRejectLateConfirmed:', e);
    }

    try {
      if (row.id_user) {
        await Model_Notifikasi.Store({
          id_user: row.id_user,
          judul: 'Pembayaran Ditolak',
          isi_pesan: `Pembayaran Anda untuk arena ${
            row.nama_arena || 'Arena'
          } ditolak karena admin tidak mengkonfirmasi pembayaran dalam batas waktu 20 menit.`,
          jenis_notif: 'status',
          tipe: 'payment',
          dibaca: 0
        });
      }
    } catch (e) {
      console.warn('Gagal kirim notif autoRejectLateConfirmed:', e);
    }
  }

  return rows.length;
}
}

module.exports = Model_Pembayaran;
