// models/Model_FotoArena.js
const connection = require('../config/database');

class Model_FotoArena {

  // Ambil SEMUA foto untuk 1 arena (untuk halaman galeri)
  static async getByArenaId(id_arena) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM foto_arena WHERE id_arena = ?', [id_arena], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }
  
  // Ambil 1 foto saja (untuk dihapus)
  static async getById(id_foto) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM foto_arena WHERE id_foto = ?', [id_foto], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }

  // Simpan foto baru ke galeri
  static async Store(Data) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO foto_arena SET ?', Data, (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }

  // Hapus 1 foto dari galeri
  static async Delete(id_foto) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM foto_arena WHERE id_foto = ?', [id_foto], (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }
}

module.exports = Model_FotoArena;