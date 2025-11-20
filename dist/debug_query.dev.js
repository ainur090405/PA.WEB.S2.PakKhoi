"use strict";

var connection = require('./config/database');

var debugQuery = "\nSELECT r.id_reservasi, r.status, p.metode_pembayaran, p.jumlah, p.status_pembayaran\nFROM reservasi r\nLEFT JOIN pembayaran p ON p.id_reservasi = r.id_reservasi\nWHERE r.status = 'Selesai'\nORDER BY r.id_reservasi DESC;\n";
connection.query(debugQuery, function (err, results) {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('Results for Selesai reservations:');
  console.table(results); // Also check all pembayaran records

  var allPaymentsQuery = "\n    SELECT * FROM pembayaran\n    WHERE id_reservasi IN (\n      SELECT id_reservasi FROM reservasi WHERE status = 'Selesai'\n    )\n    ORDER BY id_reservasi DESC;\n  ";
  connection.query(allPaymentsQuery, function (err2, payments) {
    if (err2) {
      console.error('Error getting payments:', err2);
      return;
    }

    console.log('\nAll pembayaran records for Selesai reservations:');
    console.table(payments);
    connection.end();
  });
});
//# sourceMappingURL=debug_query.dev.js.map
