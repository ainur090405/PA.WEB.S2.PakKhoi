// models/Model_Users.js
const connection = require('../config/database');
const bcrypt = require('bcryptjs'); // untuk hash password

class Model_Users {

  // =========================
  // FUNGSI EXISTING (TIDAK DIUBAH)
  // =========================
  static async getAll(){
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM users ORDER BY id_user DESC',
        (err, rows) => {
          if (err) reject(err); else resolve(rows);
        }
      );
    });
  }

  static async Store(Data){
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO users SET ?',
        Data,
        (err, result) => {
          if (err) reject(err); else resolve(result);
        }
      );
    });
  }

  static async getByEmail(email){
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, result) => {
          if (err) reject(err); else resolve(result); // array
        }
      );
    });
  }

  static async getById(id){
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM users WHERE id_user = ?',
        [id],
        (err, result) => {
          if (err) reject(err); else resolve(result);
        }
      );
    });
  }

  static async Update(id, Data){
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE users SET ? WHERE id_user = ?',
        [Data, id],
        (err, result) => {
          if (err) reject(err); else resolve(result);
        }
      );
    });
  }

  static async Delete(id){
    return new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM users WHERE id_user = ?',
        [id],
        (err, result) => {
          if (err) reject(err); else resolve(result);
        }
      );
    });
  }

  // =========================
  // TAMBAHAN UNTUK LUPA PASSWORD
  // =========================

  // Versi yang langsung balikin 1 user (bukan array)
  static async findOneByEmail(email) {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows[0] || null);
        }
      );
    });
  }

  // Simpan token reset + waktu expired ke user
  static async setResetToken(id_user, token, expiresDate) {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id_user = ?',
        [token, expiresDate, id_user],
        (err, result) => {
          if (err) reject(err); else resolve(result);
        }
      );
    });
  }

  // Cari user berdasarkan token reset yang masih berlaku
  static async findByResetToken(token) {
    return new Promise((resolve, reject) => {
      connection.query(
        `
          SELECT * FROM users
          WHERE reset_token = ?
            AND reset_token_expires IS NOT NULL
            AND reset_token_expires > NOW()
          LIMIT 1
        `,
        [token],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows[0] || null);
        }
      );
    });
  }

  // Hapus token reset setelah dipakai / kadaluarsa
  static async clearResetToken(id_user) {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id_user = ?',
        [id_user],
        (err, result) => {
          if (err) reject(err); else resolve(result);
        }
      );
    });
  }

  // Update password (plain → hash bcrypt) untuk lupa password
  static async updatePassword(id_user, plainPassword) {
    const hash = await bcrypt.hash(plainPassword, 10);

    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE users SET password = ? WHERE id_user = ?',
        [hash, id_user],
        (err, result) => {
          if (err) reject(err); else resolve(result);
        }
      );
    });
  }
}

module.exports = Model_Users;
