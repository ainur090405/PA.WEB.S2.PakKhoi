"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_Ulasan.js
var connection = require('../config/database');

var Model_Ulasan =
/*#__PURE__*/
function () {
  function Model_Ulasan() {
    _classCallCheck(this, Model_Ulasan);
  }

  _createClass(Model_Ulasan, null, [{
    key: "getByUser",
    value: function getByUser(id_user) {
      return regeneratorRuntime.async(function getByUser$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT u.rating, u.komentar, u.tanggal_ulasan, a.nama_arena\n        FROM ulasan u\n        JOIN reservasi r ON u.id_reservasi = r.id_reservasi\n        JOIN arena a ON r.id_arena = a.id_arena\n        WHERE u.id_user = ?\n        ORDER BY u.tanggal_ulasan DESC\n      ";
                connection.query(sql, [id_user], function (err, rows) {
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
    key: "getAll",
    value: function getAll() {
      return regeneratorRuntime.async(function getAll$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM ulasan', function (err, rows) {
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
    key: "getById",
    value: function getById(id) {
      return regeneratorRuntime.async(function getById$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM ulasan WHERE id_ulasan = ?', [id], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    } // ✅ tambahan fix: get ulasan berdasarkan id_reservasi

  }, {
    key: "getByReservasi",
    value: function getByReservasi(id_reservasi) {
      return regeneratorRuntime.async(function getByReservasi$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM ulasan WHERE id_reservasi = ?', [id_reservasi], function (err, rows) {
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
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO ulasan SET ?', Data, function (err, result) {
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
    key: "Update",
    value: function Update(id_reservasi, Data) {
      return regeneratorRuntime.async(function Update$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE ulasan SET ? WHERE id_reservasi = ?', [Data, id_reservasi], function (err, result) {
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
    key: "Delete",
    value: function Delete(id_reservasi) {
      return regeneratorRuntime.async(function Delete$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('DELETE FROM ulasan WHERE id_reservasi = ?', [id_reservasi], function (err, result) {
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
    key: "getByArena",
    value: function getByArena(id_arena) {
      return regeneratorRuntime.async(function getByArena$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT u.rating, u.komentar, u.tanggal_ulasan, usr.nama as nama_user\n        FROM ulasan u\n        JOIN reservasi r ON u.id_reservasi = r.id_reservasi\n        JOIN users usr ON u.id_user = usr.id_user\n        WHERE r.id_arena = ?\n        ORDER BY u.tanggal_ulasan DESC\n      ";
                connection.query(sql, [id_arena], function (err, rows) {
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
  }, {
    key: "UpdateByReservasi",
    value: function UpdateByReservasi(id_reservasi, Data) {
      return regeneratorRuntime.async(function UpdateByReservasi$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", new Promise(function (resolve, reject) {
                var sql = 'UPDATE ulasan SET ? WHERE id_reservasi = ?';
                connection.query(sql, [Data, id_reservasi], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      });
    }
  }, {
    key: "getAverageRating",
    value: function getAverageRating(id_arena) {
      return regeneratorRuntime.async(function getAverageRating$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT AVG(u.rating) as avg_rating, COUNT(u.id_ulasan) as total_reviews\n        FROM ulasan u\n        JOIN reservasi r ON u.id_reservasi = r.id_reservasi\n        WHERE r.id_arena = ?\n      ";
                connection.query(sql, [id_arena], function (err, rows) {
                  if (err) reject(err);else resolve(rows[0]);
                });
              }));

            case 1:
            case "end":
              return _context10.stop();
          }
        }
      });
    }
  }]);

  return Model_Ulasan;
}();

module.exports = Model_Ulasan;
//# sourceMappingURL=Model_Ulasan.dev.js.map
