"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var connection = require('../config/database');

var Model_Jadwal = require('./Model_Jadwal'); // ✅ Tambahkan flag di luar class (biar tetap sama di semua pemanggilan)


var isUpdating = false;

var Model_Reservasi =
/*#__PURE__*/
function () {
  function Model_Reservasi() {
    _classCallCheck(this, Model_Reservasi);
  }

  _createClass(Model_Reservasi, null, [{
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO reservasi SET ?', Data, function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }, {
    key: "getByUser",
    value: function getByUser(id_user) {
      return regeneratorRuntime.async(function getByUser$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT \n          r.id_reservasi,\n          r.status,\n          r.tanggal_pesan,\n          r.payment_method,\n          r.amount,\n          a.nama_arena,\n          j.tanggal,\n          j.jam_mulai,\n          j.jam_selesai,\n          CASE \n            WHEN u.id_ulasan IS NOT NULL THEN 1 \n            ELSE 0 \n          END AS sudah_ulasan\n        FROM reservasi r\n        JOIN arena a ON r.id_arena = a.id_arena\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        LEFT JOIN ulasan u ON r.id_reservasi = u.id_reservasi\n        WHERE r.id_user = ?\n        ORDER BY r.tanggal_pesan DESC\n      ";
                connection.query(sql, [id_user], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }, {
    key: "getAll",
    value: function getAll() {
      return regeneratorRuntime.async(function getAll$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT r.*, u.nama AS nama_user, a.nama_arena, j.tanggal, j.jam_mulai\n        FROM reservasi r\n        JOIN users u ON r.id_user = u.id_user\n        JOIN arena a ON r.id_arena = a.id_arena\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        ORDER BY r.tanggal_pesan DESC\n      ";
                connection.query(sql, function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    }
  }, {
    key: "getById",
    value: function getById(id) {
      return regeneratorRuntime.async(function getById$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT r.*, u.nama AS nama_user, a.nama_arena, j.tanggal, j.jam_mulai\n        FROM reservasi r\n        JOIN users u ON r.id_user = u.id_user\n        JOIN arena a ON r.id_arena = a.id_arena\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        WHERE r.id_reservasi = ?\n      ";
                connection.query(sql, [id], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      });
    }
  }, {
    key: "autoUpdateStatus",
    value: function autoUpdateStatus() {
      var sql;
      return regeneratorRuntime.async(function autoUpdateStatus$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!isUpdating) {
                _context5.next = 3;
                break;
              }

              console.log("⏳ Skip auto update, server sedang sibuk.");
              return _context5.abrupt("return");

            case 3:
              isUpdating = true;
              _context5.prev = 4;
              sql = "\n      -- 1\uFE0F\u20E3 Ubah ke 'selesai' jika waktu main sudah lewat\n      UPDATE reservasi r\n      JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n      SET r.status = 'selesai'\n      WHERE r.status IN ('disetujui', 'menunggu')\n        AND CONCAT(j.tanggal, ' ', j.jam_selesai) < NOW();\n\n      -- 2\uFE0F\u20E3 Jika status 'menunggu' lebih dari 20 menit \u2192 ubah jadi 'booking' + kosongkan slot\n      UPDATE reservasi r\n      JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n      SET \n        r.status = 'booking',\n        j.status_slot = 'kosong'\n      WHERE r.status = 'menunggu'\n        AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20;\n\n      -- 3\uFE0F\u20E3 Jika status 'ditolak' lebih dari 20 menit \u2192 ubah jadi 'booking' + kosongkan slot\n      UPDATE reservasi r\n      JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n      SET \n        r.status = 'booking',\n        j.status_slot = 'kosong'\n      WHERE r.status = 'ditolak'\n        AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20;\n    ";
              _context5.next = 8;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query(sql, function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 8:
              console.log("[AUTO] Status reservasi & jadwal diperbarui otomatis: ".concat(new Date().toLocaleString()));
              _context5.next = 14;
              break;

            case 11:
              _context5.prev = 11;
              _context5.t0 = _context5["catch"](4);
              console.error('❌ Gagal auto update status:', _context5.t0);

            case 14:
              _context5.prev = 14;
              isUpdating = false;
              return _context5.finish(14);

            case 17:
            case "end":
              return _context5.stop();
          }
        }
      }, null, null, [[4, 11, 14, 17]]);
    }
  }, {
    key: "isBusy",
    value: function isBusy() {
      return isUpdating;
    }
  }, {
    key: "rejectAndFreeSlot",
    value: function rejectAndFreeSlot(id_reservasi) {
      return regeneratorRuntime.async(function rejectAndFreeSlot$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n      UPDATE reservasi r\n      JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n      SET \n        r.status = 'ditolak',\n        j.status_slot = 'kosong'\n      WHERE r.id_reservasi = ?;\n    ";
                connection.query(sql, [id_reservasi], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      });
    }
  }, {
    key: "Update",
    value: function Update(id, Data) {
      return regeneratorRuntime.async(function Update$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE reservasi SET ? WHERE id_reservasi = ?', [Data, id], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context7.stop();
          }
        }
      });
    }
  }, {
    key: "Delete",
    value: function Delete(id) {
      return regeneratorRuntime.async(function Delete$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('DELETE FROM reservasi WHERE id_reservasi = ?', [id], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context8.stop();
          }
        }
      });
    }
  }]);

  return Model_Reservasi;
}();

module.exports = Model_Reservasi;
//# sourceMappingURL=Model_Reservasi.dev.js.map
