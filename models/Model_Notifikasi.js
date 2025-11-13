const connection = require('../config/database');

class Model_Notifikasi {

  static async Store(Data) {
    return new Promise((resolve, reject) => {
      // Pastikan id_user tidak null
      if (!Data.id_user) {
        reject(new Error('id_user cannot be null'));
        return;
      }
      connection.query('INSERT INTO notifikasi SET ?', Data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getByUser(id_user) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM notifikasi WHERE id_user = ? ORDER BY id_notifikasi DESC LIMIT 10`;
      connection.query(sql, [id_user], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async autoUpdateStatus() {
    if (this.isUpdating) return console.log('⏳ Skip auto update, masih jalan.');

    this.isUpdating = true;
    try {
      const sql = `
        UPDATE reservasi r
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        SET r.status = 'selesai'
        WHERE r.status IN ('disetujui', 'menunggu')
          AND CONCAT(j.tanggal, ' ', j.jam_selesai) < NOW();

        UPDATE reservasi r
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        SET r.status = 'booking', j.status_slot = 'kosong'
        WHERE r.status = 'menunggu'
          AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20;
      `;

      await new Promise((resolve, reject) => {
        connection.query(sql, (err) => (err ? reject(err) : resolve()));
      });

      const notifSql = `
        INSERT INTO notifikasi (id_user, pesan)
        SELECT r.id_user, CONCAT('Reservasi kamu di arena ', a.nama_arena, ' telah selesai otomatis.')
        FROM reservasi r
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        JOIN arena a ON j.id_arena = a.id_arena
        WHERE r.status = 'selesai';

        INSERT INTO notifikasi (id_user, pesan)
        SELECT r.id_user, CONCAT('Reservasi kamu di arena ', a.nama_arena, ' dibatalkan otomatis karena tidak dikonfirmasi admin.')
        FROM reservasi r
        JOIN jadwal j ON r.id_jadwal = j.id_jadwal
        JOIN arena a ON j.id_arena = a.id_arena
        WHERE r.status = 'booking';
      `;

      await new Promise((resolve, reject) => {
        connection.query(notifSql, (err) => (err ? reject(err) : resolve()));
      });

      console.log(`[AUTO] Status & notifikasi diperbarui otomatis ${new Date().toLocaleString()}`);
    } catch (err) {
      console.error('❌ Error auto update:', err);
    } finally {
      this.isUpdating = false;
    }
  }


  static async getUnreadCount(id_user) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) as count FROM notifikasi WHERE id_user = ? AND dibaca = 0`;
      connection.query(sql, [id_user], (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0].count);
      });
    });
  }

  static async markAsRead(id_notifikasi) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE notifikasi SET dibaca = 1 WHERE id_notifikasi = ?', [id_notifikasi], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async markAllAsRead(id_user) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE notifikasi SET dibaca = 1 WHERE id_user = ?', [id_user], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Model_Notifikasi;
