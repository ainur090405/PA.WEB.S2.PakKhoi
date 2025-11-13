const connection = require('../config/database');

class Model_Pembayaran {

  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, r.id_user, r.id_arena, a.nama_arena, u.nama as nama_user
        FROM pembayaran p
        JOIN reservasi r ON p.id_reservasi = r.id_reservasi
        JOIN arena a ON r.id_arena = a.id_arena
        JOIN users u ON r.id_user = u.id_user
        ORDER BY p.tanggal_pembayaran DESC
      `;
      connection.query(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM pembayaran WHERE id_pembayaran = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getByReservasi(id_reservasi) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM pembayaran WHERE id_reservasi = ?', [id_reservasi], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async Store(Data) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO pembayaran SET ?', Data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async Update(id, Data) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE pembayaran SET ? WHERE id_pembayaran = ?', [Data, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async Delete(id) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM pembayaran WHERE id_pembayaran = ?', [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Confirm payment by admin
  static async confirmPayment(id_pembayaran, status, catatan_admin = null) {
    return new Promise((resolve, reject) => {
      const data = {
        status_pembayaran: status,
        konfirmasi_admin: true,
        catatan_admin: catatan_admin
      };
      connection.query('UPDATE pembayaran SET ? WHERE id_pembayaran = ?', [data, id_pembayaran], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Get pending payments for admin confirmation
  static async getPendingPayments() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, r.id_user, r.id_arena, a.nama_arena, u.nama as nama_user
        FROM pembayaran p
        JOIN reservasi r ON p.id_reservasi = r.id_reservasi
        JOIN arena a ON r.id_arena = a.id_arena
        JOIN users u ON r.id_user = u.id_user
        WHERE p.status_pembayaran = 'pending' AND p.konfirmasi_admin = false
        ORDER BY p.tanggal_pembayaran ASC
      `;
      connection.query(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Model_Pembayaran;
