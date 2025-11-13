"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var connection = require('../config/database');

var Model_Notifikasi =
/*#__PURE__*/
function () {
  function Model_Notifikasi() {
    _classCallCheck(this, Model_Notifikasi);
  }

  _createClass(Model_Notifikasi, null, [{
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                // Pastikan id_user tidak null
                if (!Data.id_user) {
                  reject(new Error('id_user cannot be null'));
                  return;
                }

                connection.query('INSERT INTO notifikasi SET ?', Data, function (err, result) {
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
                var sql = "SELECT * FROM notifikasi WHERE id_user = ? ORDER BY id_notifikasi DESC LIMIT 10";
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
    key: "autoUpdateStatus",
    value: function autoUpdateStatus() {
      var sql, notifSql;
      return regeneratorRuntime.async(function autoUpdateStatus$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!this.isUpdating) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return", console.log('⏳ Skip auto update, masih jalan.'));

            case 2:
              this.isUpdating = true;
              _context3.prev = 3;
              sql = "\n        UPDATE reservasi r\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        SET r.status = 'selesai'\n        WHERE r.status IN ('disetujui', 'menunggu')\n          AND CONCAT(j.tanggal, ' ', j.jam_selesai) < NOW();\n\n        UPDATE reservasi r\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        SET r.status = 'booking', j.status_slot = 'kosong'\n        WHERE r.status = 'menunggu'\n          AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20;\n      ";
              _context3.next = 7;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query(sql, function (err) {
                  return err ? reject(err) : resolve();
                });
              }));

            case 7:
              notifSql = "\n        INSERT INTO notifikasi (id_user, pesan)\n        SELECT r.id_user, CONCAT('Reservasi kamu di arena ', a.nama_arena, ' telah selesai otomatis.')\n        FROM reservasi r\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        JOIN arena a ON j.id_arena = a.id_arena\n        WHERE r.status = 'selesai';\n\n        INSERT INTO notifikasi (id_user, pesan)\n        SELECT r.id_user, CONCAT('Reservasi kamu di arena ', a.nama_arena, ' dibatalkan otomatis karena tidak dikonfirmasi admin.')\n        FROM reservasi r\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        JOIN arena a ON j.id_arena = a.id_arena\n        WHERE r.status = 'booking';\n      ";
              _context3.next = 10;
              return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                connection.query(notifSql, function (err) {
                  return err ? reject(err) : resolve();
                });
              }));

            case 10:
              console.log("[AUTO] Status & notifikasi diperbarui otomatis ".concat(new Date().toLocaleString()));
              _context3.next = 16;
              break;

            case 13:
              _context3.prev = 13;
              _context3.t0 = _context3["catch"](3);
              console.error('❌ Error auto update:', _context3.t0);

            case 16:
              _context3.prev = 16;
              this.isUpdating = false;
              return _context3.finish(16);

            case 19:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this, [[3, 13, 16, 19]]);
    }
  }, {
    key: "getUnreadCount",
    value: function getUnreadCount(id_user) {
      return regeneratorRuntime.async(function getUnreadCount$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "SELECT COUNT(*) as count FROM notifikasi WHERE id_user = ? AND dibaca = 0";
                connection.query(sql, [id_user], function (err, rows) {
                  if (err) reject(err);else resolve(rows[0].count);
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
    key: "markAsRead",
    value: function markAsRead(id_notifikasi) {
      return regeneratorRuntime.async(function markAsRead$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE notifikasi SET dibaca = 1 WHERE id_notifikasi = ?', [id_notifikasi], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      });
    }
  }, {
    key: "markAllAsRead",
    value: function markAllAsRead(id_user) {
      return regeneratorRuntime.async(function markAllAsRead$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE notifikasi SET dibaca = 1 WHERE id_user = ?', [id_user], function (err, result) {
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
  }]);

  return Model_Notifikasi;
}();

module.exports = Model_Notifikasi;
//# sourceMappingURL=Model_Notifikasi.dev.js.map
