"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_Jadwal.js
var connection = require('../config/database');

var Model_Jadwal =
/*#__PURE__*/
function () {
  function Model_Jadwal() {
    _classCallCheck(this, Model_Jadwal);
  }

  _createClass(Model_Jadwal, null, [{
    key: "getAll",
    // FUNGSI BARU: Ambil semua jadwal (JOIN dengan arena)
    value: function getAll() {
      return regeneratorRuntime.async(function getAll$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT j.*, a.nama_arena \n        FROM jadwal j\n        JOIN arena a ON j.id_arena = a.id_arena\n        ORDER BY j.tanggal DESC, j.jam_mulai ASC\n      ";
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
                var sql = "\n        SELECT j.*, a.nama_arena, a.jam_buka, a.jam_tutup \n        FROM jadwal j\n        JOIN arena a ON j.id_arena = a.id_arena\n        WHERE j.id_jadwal = ?\n      ";
                connection.query(sql, [id], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // FUNGSI BARU: Ambil semua jadwal masa depan untuk 1 arena (termasuk yang sudah terisi, untuk tampilan)

  }, {
    key: "getAvailableByArenaId",
    value: function getAvailableByArenaId(id_arena) {
      return regeneratorRuntime.async(function getAvailableByArenaId$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT * FROM jadwal\n        WHERE id_arena = ?\n          AND (\n            tanggal > CURDATE()  -- Hari mendatang\n            OR (tanggal = CURDATE() AND jam_mulai > CURTIME())  -- Hari ini tapi jam belum lewat\n          )\n        ORDER BY tanggal ASC, jam_mulai ASC\n      ";
                connection.query(sql, [id_arena], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    } // FUNGSI BARU UNTUK GENERATOR

  }, {
    key: "StoreMany",
    value: function StoreMany(sesiData) {
      return regeneratorRuntime.async(function StoreMany$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                // 1. Ubah array of objects [{}, {}] menjadi array of arrays [[], []]
                var values = sesiData.map(function (sesi) {
                  return [sesi.id_arena, sesi.tanggal, sesi.jam_mulai, sesi.jam_selesai, sesi.status_slot];
                }); // 2. Query SQL untuk bulk insert (menyimpan banyak data sekaligus)

                var sql = 'INSERT INTO jadwal (id_arena, tanggal, jam_mulai, jam_selesai, status_slot) VALUES ?';
                connection.query(sql, [values], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      });
    } // FUNGSI BARU: Simpan jadwal baru

  }, {
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO jadwal SET ?', Data, function (err, result) {
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
    value: function Update(id_jadwal, data) {
      return regeneratorRuntime.async(function Update$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                var sql = 'UPDATE jadwal SET ? WHERE id_jadwal = ?';
                connection.query(sql, [data, id_jadwal], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      });
    } // FUNGSI BARU: Hapus jadwal

  }, {
    key: "Delete",
    value: function Delete(id) {
      return regeneratorRuntime.async(function Delete$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('DELETE FROM jadwal WHERE id_jadwal = ?', [id], function (err, result) {
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
  }]);

  return Model_Jadwal;
}();

module.exports = Model_Jadwal;
//# sourceMappingURL=Model_Jadwal.dev.js.map
