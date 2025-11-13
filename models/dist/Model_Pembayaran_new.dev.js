"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var connection = require('../config/database');

var Model_Pembayaran =
/*#__PURE__*/
function () {
  function Model_Pembayaran() {
    _classCallCheck(this, Model_Pembayaran);
  }

  _createClass(Model_Pembayaran, null, [{
    key: "getAll",
    value: function getAll() {
      return regeneratorRuntime.async(function getAll$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT p.*, r.id_user, r.id_arena, a.nama_arena, u.nama as nama_user\n        FROM pembayaran p\n        JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n        JOIN arena a ON r.id_arena = a.id_arena\n        JOIN users u ON r.id_user = u.id_user\n        ORDER BY p.tanggal_pembayaran DESC\n      ";
                connection.query(sql, function (err, rows) {
                  if (err) reject(err);else resolve(rows);
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
    key: "getById",
    value: function getById(id) {
      return regeneratorRuntime.async(function getById$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM pembayaran WHERE id_pembayaran = ?', [id], function (err, rows) {
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
    key: "getByReservasi",
    value: function getByReservasi(id_reservasi) {
      return regeneratorRuntime.async(function getByReservasi$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM pembayaran WHERE id_reservasi = ?', [id_reservasi], function (err, rows) {
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
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO pembayaran SET ?', Data, function (err, result) {
                  if (err) reject(err);else resolve(result);
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
    key: "Update",
    value: function Update(id, Data) {
      return regeneratorRuntime.async(function Update$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE pembayaran SET ? WHERE id_pembayaran = ?', [Data, id], function (err, result) {
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
    key: "Delete",
    value: function Delete(id) {
      return regeneratorRuntime.async(function Delete$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('DELETE FROM pembayaran WHERE id_pembayaran = ?', [id], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      });
    } // Confirm payment by admin

  }, {
    key: "confirmPayment",
    value: function confirmPayment(id_pembayaran, status) {
      var catatan_admin,
          _args7 = arguments;
      return regeneratorRuntime.async(function confirmPayment$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              catatan_admin = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : null;
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                var data = {
                  status_pembayaran: status,
                  konfirmasi_admin: true,
                  catatan_admin: catatan_admin
                };
                connection.query('UPDATE pembayaran SET ? WHERE id_pembayaran = ?', [data, id_pembayaran], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 2:
            case "end":
              return _context7.stop();
          }
        }
      });
    } // Get pending payments for admin confirmation

  }, {
    key: "getPendingPayments",
    value: function getPendingPayments() {
      return regeneratorRuntime.async(function getPendingPayments$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT p.*, r.id_user, r.id_arena, a.nama_arena, u.nama as nama_user\n        FROM pembayaran p\n        JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n        JOIN arena a ON r.id_arena = a.id_arena\n        JOIN users u ON r.id_user = u.id_user\n        WHERE p.status_pembayaran = 'pending' AND p.konfirmasi_admin = false\n        ORDER BY p.tanggal_pembayaran ASC\n      ";
                connection.query(sql, function (err, rows) {
                  if (err) reject(err);else resolve(rows);
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

  return Model_Pembayaran;
}();

module.exports = Model_Pembayaran;
//# sourceMappingURL=Model_Pembayaran_new.dev.js.map
