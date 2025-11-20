// models/Model_Pembayaran.js
const connection = require('../config/database');

class Model_Pembayaran {
  // ========================
  // BASIC GET / CRUD
  // ========================

  // Ambil semua pembayaran (untuk admin, join user & arena)
  static async getAllWithUserArena() {
    return new Promise((resolve, reject) => {
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
      connection.query(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  static async getById(id_pembayaran) {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM pembayaran WHERE id_pembayaran = ?',
        [id_pembayaran],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Ambil 1 pembayaran berdasarkan reservasi
  static async getByReservasi(id_reservasi) {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM pembayaran WHERE id_reservasi = ? LIMIT 1',
        [id_reservasi],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
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
        status_pembayaran: 'pending',       // enum('pending','uploaded','paid','confirmed','unpaid')
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
              metode_pembayaran: 'transaksi',   // sesuai enum di tabel
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

  /**
   * status:
   *   - 'confirmed' → pembayaran fix (bisa untuk COD atau transfer)
   *   - 'paid'      → COD sudah dibayar tapi belum final, terserah flow-mu
   *   - 'unpaid'    → belum bayar (COD)
   *   - 'uploaded'  → jarang dipakai, kita pakai status_bukti utk ini
   *
   * Catatan: JANGAN gunakan 'rejected' karena tidak ada di enum status_pembayaran.
   */
  static async confirmPaymentByReservasi(id_reservasi, status, catatan_admin = null) {
    return new Promise((resolve, reject) => {
      const data = {
        status_pembayaran: status,
        // status_bukti hanya relevan untuk transfer
        status_bukti: status === 'confirmed' || status === 'paid'
          ? 'uploaded'    // bukti tetap 'uploaded'
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
    return new Promise((resolve, reject) => {
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
      connection.query(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = Model_Pembayaran;
