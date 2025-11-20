"use strict";

var Model_LogReservasi = require('../models/Model_LogReservasi');

function createLog(id_reservasi, status_awal, status_baru) {
  var keterangan,
      _args = arguments;
  return regeneratorRuntime.async(function createLog$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          keterangan = _args.length > 3 && _args[3] !== undefined ? _args[3] : '';
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(Model_LogReservasi.store({
            id_reservasi: id_reservasi,
            waktu_perubahan: new Date(),
            status_awal: status_awal,
            status_baru: status_baru,
            keterangan: keterangan
          }));

        case 4:
          _context.next = 9;
          break;

        case 6:
          _context.prev = 6;
          _context.t0 = _context["catch"](1);
          console.error('Gagal membuat log reservasi:', _context.t0);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 6]]);
}

module.exports = {
  createLog: createLog
};
//# sourceMappingURL=logHelper.dev.js.map
