"use strict";

var connection = require('./config/database');

var debugQuery = "\nSELECT r.id_reservasi, r.status, p.metode_pembayaran, p.jumlah, p.status_pembayaran\nFROM reservasi r\nLEFT JOIN pembayaran p ON p.id_reservasi = r.id_reservasi\nWHERE r.status = 'Selesai'\nORDER BY r.id_reservasi DESC;\n";
connection.query(debugQuery, function (err, results) {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('Results for Selesai reservations:');
  console.table(results); // Check what getAll returns for these records

  var Model_Reservasi = require('./models/Model_Reservasi');

  Model_Reservasi.getAll().then(function (allData) {
    console.log('\nWhat getAll() returns for Selesai records:');
    var selesaiRecords = allData.filter(function (r) {
      return r.status === 'selesai';
    });
    console.table(selesaiRecords.map(function (r) {
      return {
        id_reservasi: r.id_reservasi,
        status: r.status,
        metode_pembayaran: r.metode_pembayaran,
        jumlah: r.jumlah,
        status_pembayaran: r.status_pembayaran,
        bukti_pembayaran: r.bukti_pembayaran
      };
    }));
    connection.end();
  })["catch"](function (err) {
    console.error('Error getting all data:', err);
    connection.end();
  });
});
//# sourceMappingURL=debug_query2.dev.js.map
