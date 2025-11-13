"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_Arena.js
var connection = require('../config/database');

var Model_Arena =
/*#__PURE__*/
function () {
  function Model_Arena() {
    _classCallCheck(this, Model_Arena);
  }

  _createClass(Model_Arena, null, [{
    key: "getAll",
    // FUNGSI UPDATE: Ambil semua arena (termasuk foto cover)
    value: function getAll() {
      return regeneratorRuntime.async(function getAll$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT a.*, f.url_foto AS foto_cover \n        FROM arena a\n        LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n        ORDER BY a.id_arena DESC\n      ";
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
    } // FUNGSI UPDATE: Ambil 1 arena (termasuk foto cover)

  }, {
    key: "getById",
    value: function getById(id) {
      return regeneratorRuntime.async(function getById$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT a.*, f.url_foto AS foto_cover\n        FROM arena a\n        LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n        WHERE a.id_arena = ?\n      ";
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
    } // FUNGSI UPDATE: Ambil arena untuk publik (termasuk foto cover)

  }, {
    key: "getPublic",
    value: function getPublic(filter) {
      return regeneratorRuntime.async(function getPublic$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                var params = [];
                var sql = "\n        SELECT a.*, f.url_foto AS foto_cover \n        FROM arena a\n        LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n        WHERE a.status = 'aktif'\n      ";

                if (filter.lokasi) {
                  sql += ' AND a.lokasi LIKE ?';
                  params.push('%' + filter.lokasi + '%');
                }

                if (filter.jenis) {
                  sql += ' AND a.jenis_olahraga = ?';
                  params.push(filter.jenis);
                }

                sql += ' ORDER BY a.nama_arena ASC';
                connection.query(sql, params, function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    } // FUNGSI UPDATE: Ambil arena untuk Home (termasuk foto cover)

  }, {
    key: "getFeatured",
    value: function getFeatured() {
      return regeneratorRuntime.async(function getFeatured$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT a.*, f.url_foto AS foto_cover\n        FROM arena a \n        LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n        WHERE a.status = 'aktif' AND a.id_foto_cover IS NOT NULL\n        LIMIT 3\n      ";
                connection.query(sql, function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      });
    } // FUNGSI UPDATE: Ambil jenis olahraga unik (tidak berubah, tapi penting)

  }, {
    key: "getJenisOlahragaList",
    value: function getJenisOlahragaList() {
      return regeneratorRuntime.async(function getJenisOlahragaList$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT DISTINCT jenis_olahraga \n        FROM arena \n        WHERE status = 'aktif' AND jenis_olahraga IS NOT NULL \n        ORDER BY jenis_olahraga ASC\n      ";
                connection.query(sql, function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      });
    } // FUNGSI BARU: Untuk set foto cover

  }, {
    key: "setCover",
    value: function setCover(id_arena, id_foto) {
      return regeneratorRuntime.async(function setCover$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE arena SET id_foto_cover = ? WHERE id_arena = ?', [id_foto, id_arena], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      });
    } // --- Fungsi CRUD (tidak berubah) ---

  }, {
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO arena SET ?', Data, function (err, result) {
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
    key: "Update",
    value: function Update(id, Data) {
      return regeneratorRuntime.async(function Update$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE arena SET ? WHERE id_arena = ?', [Data, id], function (err, result) {
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
  }, {
    key: "Delete",
    value: function Delete(id) {
      return regeneratorRuntime.async(function Delete$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('DELETE FROM arena WHERE id_arena = ?', [id], function (err, result) {
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
  }]);

  return Model_Arena;
}();

module.exports = Model_Arena;
//# sourceMappingURL=Model_Arena.dev.js.map
