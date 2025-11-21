"use strict";

var mysql = require('mysql');

var connection = mysql.createConnection({
  host: '127.0.0.1',
  // Ini sama dengan 'localhost'
  user: 'root',
  password: '',
  // Masukkan password MySQL Anda di sini
  database: 'arenago',
  multipleStatements: true,
  // <-- PASTIKAN INI 'arenago' BUKAN 'parkir'
  port: 3306
}); // tes koneksi

connection.connect(function (err) {
  if (err) {
    console.error('❌ eror koneksi database', err.message);
    return;
  }

  console.log('✅ oke nyambung bang');
});
module.exports = connection;
//# sourceMappingURL=database.dev.js.map
