"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var connection = require('../config/database');

var Model_LogReservasi =
/*#__PURE__*/
function () {
  function Model_LogReservasi() {
    _classCallCheck(this, Model_LogReservasi);
  }

  _createClass(Model_LogReservasi, null, [{
    key: "getByReservasi",
    // ===========================
    // AMBIL SEMUA LOG PER RESERVASI
    // ===========================
    value: function getByReservasi(id_reservasi) {
      return regeneratorRuntime.async(function getByReservasi$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                connection.query("SELECT *\n         FROM log_reservasi\n         WHERE id_reservasi = ?\n         ORDER BY waktu_perubahan DESC", [id_reservasi], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      });
    } // ===========================
    // TAMBAH LOG BARU
    // ===========================

  }, {
    key: "Store",
    value: function Store(data) {
      return regeneratorRuntime.async(function Store$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                connection.query("INSERT INTO log_reservasi SET ?", data, function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // ===========================
    // CATAT PERUBAHAN STATUS (PRAKTIS)
    // ===========================

  }, {
    key: "catatStatus",
    value: function catatStatus(id_reservasi, status_awal, status_baru) {
      var keterangan,
          data,
          _args3 = arguments;
      return regeneratorRuntime.async(function catatStatus$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              keterangan = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : null;
              data = {
                id_reservasi: id_reservasi,
                status_awal: status_awal,
                status_baru: status_baru,
                waktu_perubahan: new Date(),
                keterangan: keterangan
              };
              return _context3.abrupt("return", this.Store(data));

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);

  return Model_LogReservasi;
}();

module.exports = Model_LogReservasi;
//# sourceMappingURL=Model_LogReservasi.dev.js.map
