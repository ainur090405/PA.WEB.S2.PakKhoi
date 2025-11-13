"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_FotoArena.js
var connection = require('../config/database');

var Model_FotoArena =
/*#__PURE__*/
function () {
  function Model_FotoArena() {
    _classCallCheck(this, Model_FotoArena);
  }

  _createClass(Model_FotoArena, null, [{
    key: "getByArenaId",
    // Ambil SEMUA foto untuk 1 arena (untuk halaman galeri)
    value: function getByArenaId(id_arena) {
      return regeneratorRuntime.async(function getByArenaId$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM foto_arena WHERE id_arena = ?', [id_arena], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      });
    } // Ambil 1 foto saja (untuk dihapus)

  }, {
    key: "getById",
    value: function getById(id_foto) {
      return regeneratorRuntime.async(function getById$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM foto_arena WHERE id_foto = ?', [id_foto], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // Simpan foto baru ke galeri

  }, {
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO foto_arena SET ?', Data, function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    } // Hapus 1 foto dari galeri

  }, {
    key: "Delete",
    value: function Delete(id_foto) {
      return regeneratorRuntime.async(function Delete$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('DELETE FROM foto_arena WHERE id_foto = ?', [id_foto], function (err, result) {
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
  }]);

  return Model_FotoArena;
}();

module.exports = Model_FotoArena;
//# sourceMappingURL=Model_FotoArena.dev.js.map
