"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_Arena.js
var connection = require('../config/database'); // helper query pakai Promise


function runQuery(sql) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return new Promise(function (resolve, reject) {
    connection.query(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

var Model_Arena =
/*#__PURE__*/
function () {
  function Model_Arena() {
    _classCallCheck(this, Model_Arena);
  }

  _createClass(Model_Arena, null, [{
    key: "getAll",
    // Ambil semua arena (untuk admin) + cover
    value: function getAll() {
      var sql;
      return regeneratorRuntime.async(function getAll$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              sql = "\n      SELECT a.*, f.url_foto AS foto_cover \n      FROM arena a\n      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n      ORDER BY a.id_arena DESC\n    ";
              return _context.abrupt("return", runQuery(sql));

            case 2:
            case "end":
              return _context.stop();
          }
        }
      });
    } // Ambil 1 arena (detail) + cover + rata-rata rating

  }, {
    key: "getById",
    value: function getById(id) {
      var sql;
      return regeneratorRuntime.async(function getById$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              sql = "\n      SELECT \n        a.*,\n        f.url_foto AS foto_cover,\n        COALESCE(ur.avg_rating, 0)   AS avg_rating,\n        COALESCE(ur.total_review, 0) AS total_review\n      FROM arena a\n      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n      LEFT JOIN (\n        SELECT \n          r.id_arena,\n          AVG(u.rating)  AS avg_rating,\n          COUNT(*)       AS total_review\n        FROM ulasan u\n        JOIN reservasi r ON u.id_reservasi = r.id_reservasi\n        GROUP BY r.id_arena\n      ) ur ON ur.id_arena = a.id_arena\n      WHERE a.id_arena = ?\n    ";
              return _context2.abrupt("return", runQuery(sql, [id]));

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // Ambil arena untuk publik (/venues) + cover + rating

  }, {
    key: "getPublic",
    value: function getPublic(filter) {
      var params, sql;
      return regeneratorRuntime.async(function getPublic$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              params = [];
              sql = "\n      SELECT \n        a.*,\n        f.url_foto AS foto_cover,\n        COALESCE(ur.avg_rating, 0)   AS avg_rating,\n        COALESCE(ur.total_review, 0) AS total_review\n      FROM arena a\n      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n      LEFT JOIN (\n        SELECT \n          r.id_arena,\n          AVG(u.rating)  AS avg_rating,\n          COUNT(*)       AS total_review\n        FROM ulasan u\n        JOIN reservasi r ON u.id_reservasi = r.id_reservasi\n        GROUP BY r.id_arena\n      ) ur ON ur.id_arena = a.id_arena\n      WHERE a.status = 'aktif'\n    ";

              if (filter.lokasi) {
                sql += ' AND a.lokasi LIKE ?';
                params.push('%' + filter.lokasi + '%');
              }

              if (filter.jenis) {
                sql += ' AND a.jenis_olahraga = ?';
                params.push(filter.jenis);
              }

              sql += ' ORDER BY a.nama_arena ASC';
              return _context3.abrupt("return", runQuery(sql, params));

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      });
    } // Ambil arena untuk Home (rekomendasi) + cover + rating

  }, {
    key: "getFeatured",
    value: function getFeatured() {
      var sql;
      return regeneratorRuntime.async(function getFeatured$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              sql = "\n      SELECT \n        a.*,\n        f.url_foto AS foto_cover,\n        COALESCE(ur.avg_rating, 0)   AS avg_rating,\n        COALESCE(ur.total_review, 0) AS total_review\n      FROM arena a \n      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n      LEFT JOIN (\n        SELECT \n          r.id_arena,\n          AVG(u.rating)  AS avg_rating,\n          COUNT(*)       AS total_review\n        FROM ulasan u\n        JOIN reservasi r ON u.id_reservasi = r.id_reservasi\n        GROUP BY r.id_arena\n      ) ur ON ur.id_arena = a.id_arena\n      WHERE a.status = 'aktif' \n        AND a.id_foto_cover IS NOT NULL\n      ORDER BY ur.avg_rating DESC, ur.total_review DESC, a.id_arena DESC\n      LIMIT 3\n    ";
              return _context4.abrupt("return", runQuery(sql));

            case 2:
            case "end":
              return _context4.stop();
          }
        }
      });
    } // Jenis olahraga unik (filter di /venues)

  }, {
    key: "getJenisOlahragaList",
    value: function getJenisOlahragaList() {
      var sql;
      return regeneratorRuntime.async(function getJenisOlahragaList$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              sql = "\n      SELECT DISTINCT jenis_olahraga \n      FROM arena \n      WHERE status = 'aktif' AND jenis_olahraga IS NOT NULL \n      ORDER BY jenis_olahraga ASC\n    ";
              return _context5.abrupt("return", runQuery(sql));

            case 2:
            case "end":
              return _context5.stop();
          }
        }
      });
    } // Arena teratas berdasarkan rating (buat statistik / rekomendasi khusus)

  }, {
    key: "getTopWithRating",
    value: function getTopWithRating() {
      var limit,
          sql,
          _args6 = arguments;
      return regeneratorRuntime.async(function getTopWithRating$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              limit = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : 3;
              sql = "\n      SELECT \n        a.*,\n        f.url_foto AS foto_cover,\n        COALESCE(AVG(u.rating), 0) AS avg_rating,\n        COUNT(u.id_ulasan)         AS total_ulasan\n      FROM arena a\n      LEFT JOIN foto_arena f ON a.id_foto_cover = f.id_foto\n      LEFT JOIN reservasi r ON r.id_arena = a.id_arena\n      LEFT JOIN ulasan u     ON u.id_reservasi = r.id_reservasi\n      WHERE a.status = 'aktif'\n      GROUP BY a.id_arena\n      ORDER BY avg_rating DESC, total_ulasan DESC, a.id_arena DESC\n      LIMIT ?\n    ";
              return _context6.abrupt("return", runQuery(sql, [Number(limit) || 3]));

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      });
    } // Set foto cover

  }, {
    key: "setCover",
    value: function setCover(id_arena, id_foto) {
      var sql;
      return regeneratorRuntime.async(function setCover$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              sql = 'UPDATE arena SET id_foto_cover = ? WHERE id_arena = ?';
              return _context7.abrupt("return", runQuery(sql, [id_foto, id_arena]));

            case 2:
            case "end":
              return _context7.stop();
          }
        }
      });
    } // --- CRUD standar ---

  }, {
    key: "Store",
    value: function Store(Data) {
      var sql;
      return regeneratorRuntime.async(function Store$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              sql = 'INSERT INTO arena SET ?';
              return _context8.abrupt("return", runQuery(sql, [Data]));

            case 2:
            case "end":
              return _context8.stop();
          }
        }
      });
    }
  }, {
    key: "Update",
    value: function Update(id, Data) {
      var sql;
      return regeneratorRuntime.async(function Update$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              sql = 'UPDATE arena SET ? WHERE id_arena = ?';
              return _context9.abrupt("return", runQuery(sql, [Data, id]));

            case 2:
            case "end":
              return _context9.stop();
          }
        }
      });
    }
  }, {
    key: "Delete",
    value: function Delete(id) {
      var sql;
      return regeneratorRuntime.async(function Delete$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              sql = 'DELETE FROM arena WHERE id_arena = ?';
              return _context10.abrupt("return", runQuery(sql, [id]));

            case 2:
            case "end":
              return _context10.stop();
          }
        }
      });
    }
  }]);

  return Model_Arena;
}();

module.exports = Model_Arena;
//# sourceMappingURL=Model_Arena.dev.js.map
