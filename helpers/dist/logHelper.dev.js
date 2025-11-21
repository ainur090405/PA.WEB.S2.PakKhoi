"use strict";

// helpers/logHelper.js
var Model_LogReservasi = require('../models/Model_LogReservasi');

function createLog(id_reservasi, status_awal, status_akhir, keterangan) {
  return regeneratorRuntime.async(function createLog$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Model_LogReservasi.Store({
            // <- gunakan Store (S besar)
            id_reservasi: id_reservasi,
            status_awal: status_awal,
            status_akhir: status_akhir,
            keterangan: keterangan,
            created_at: new Date()
          }));

        case 3:
          _context.next = 8;
          break;

        case 5:
          _context.prev = 5;
          _context.t0 = _context["catch"](0);
          console.error('Gagal membuat log reservasi:', _context.t0);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 5]]);
}

module.exports = {
  createLog: createLog
};
//# sourceMappingURL=logHelper.dev.js.map
