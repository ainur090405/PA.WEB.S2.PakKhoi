const connection = require('../config/database');

class Model_LogReservasi {

  // ===========================
  // AMBIL SEMUA LOG PER RESERVASI
  // ===========================
  static async getByReservasi(id_reservasi) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT *
         FROM log_reservasi
         WHERE id_reservasi = ?
         ORDER BY waktu_perubahan DESC`,
        [id_reservasi],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // ===========================
  // TAMBAH LOG BARU
  // ===========================
  static async Store(data) {
    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO log_reservasi SET ?`,
        data,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  // ===========================
  // CATAT PERUBAHAN STATUS (PRAKTIS)
  // ===========================
  static async catatStatus(id_reservasi, status_awal, status_baru, keterangan = null) {
    const data = {
      id_reservasi,
      status_awal,
      status_baru,
      waktu_perubahan: new Date(),
      keterangan
    };
    
    return this.Store(data);
  }

}

module.exports = Model_LogReservasi;
