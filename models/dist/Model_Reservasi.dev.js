"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_Reservasi.js
var connection = require('../config/database');

var Model_Jadwal = require('./Model_Jadwal'); // helper Promise


function runQuery(sql) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return new Promise(function (resolve, reject) {
    connection.query(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

var isUpdating = false;

var Model_Reservasi =
/*#__PURE__*/
function () {
  function Model_Reservasi() {
    _classCallCheck(this, Model_Reservasi);
  }

  _createClass(Model_Reservasi, null, [{
    key: "Store",
    // CREATE
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", runQuery('INSERT INTO reservasi SET ?', [Data]));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      });
    } // GET BY USER

  }, {
    key: "getByUser",
    value: function getByUser(id_user) {
      var sql;
      return regeneratorRuntime.async(function getByUser$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              sql = "\n      SELECT\n        r.*,\n        a.nama_arena,\n        j.tanggal,\n        j.jam_mulai,\n        j.jam_selesai,\n\n        p.id_pembayaran,\n        p.metode_pembayaran   AS pembayaran_metode,\n        p.status_pembayaran   AS pembayaran_status,\n        p.status_bukti        AS pembayaran_status_bukti,\n        p.bukti_pembayaran    AS pembayaran_bukti,\n        p.jumlah              AS pembayaran_jumlah,\n        p.tanggal_pembayaran  AS pembayaran_tanggal,\n        p.konfirmasi_admin    AS pembayaran_konfirmasi,\n        p.catatan_admin       AS pembayaran_catatan\n\n      FROM reservasi r\n      JOIN arena a ON r.id_arena = a.id_arena\n      JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n      LEFT JOIN pembayaran p ON p.id_reservasi = r.id_reservasi\n      WHERE r.id_user = ?\n      ORDER BY r.tanggal_pesan DESC\n    ";
              return _context2.abrupt("return", runQuery(sql, [id_user]));

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // GET ALL (ADMIN)

  }, {
    key: "getAll",
    value: function getAll() {
      var sql;
      return regeneratorRuntime.async(function getAll$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              sql = "\n      SELECT\n        r.*,\n        u.nama              AS nama_user,\n        a.nama_arena,\n        j.tanggal,\n        j.jam_mulai,\n        j.jam_selesai,\n\n        p.id_pembayaran,\n        p.metode_pembayaran   AS pembayaran_metode,\n        p.status_pembayaran   AS pembayaran_status,\n        p.status_bukti        AS pembayaran_status_bukti,\n        p.bukti_pembayaran    AS pembayaran_bukti,\n        p.jumlah              AS pembayaran_jumlah,\n        p.tanggal_pembayaran  AS pembayaran_tanggal,\n        p.konfirmasi_admin    AS pembayaran_konfirmasi,\n        p.catatan_admin       AS pembayaran_catatan\n\n      FROM reservasi r\n      JOIN users u   ON r.id_user = u.id_user\n      JOIN arena a   ON r.id_arena = a.id_arena\n      JOIN jadwal j  ON r.id_jadwal = j.id_jadwal\n      LEFT JOIN pembayaran p ON p.id_reservasi = r.id_reservasi\n      ORDER BY r.tanggal_pesan DESC\n    ";
              return _context3.abrupt("return", runQuery(sql));

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      });
    } // GET BY ID

  }, {
    key: "getById",
    value: function getById(id) {
      var sql;
      return regeneratorRuntime.async(function getById$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              sql = "\n      SELECT\n        r.*,\n        u.nama              AS nama_user,\n        a.nama_arena,\n        j.tanggal,\n        j.jam_mulai,\n        j.jam_selesai,\n\n        p.id_pembayaran,\n        p.metode_pembayaran   AS pembayaran_metode,\n        p.status_pembayaran   AS pembayaran_status,\n        p.status_bukti        AS pembayaran_status_bukti,\n        p.bukti_pembayaran    AS pembayaran_bukti,\n        p.jumlah              AS pembayaran_jumlah,\n        p.tanggal_pembayaran  AS pembayaran_tanggal,\n        p.konfirmasi_admin    AS pembayaran_konfirmasi,\n        p.catatan_admin       AS pembayaran_catatan\n\n      FROM reservasi r\n      JOIN users u   ON r.id_user = u.id_user\n      JOIN arena a   ON r.id_arena = a.id_arena\n      JOIN jadwal j  ON r.id_jadwal = j.id_jadwal\n      LEFT JOIN pembayaran p ON p.id_reservasi = r.id_reservasi\n      WHERE r.id_reservasi = ?\n      LIMIT 1\n    ";
              return _context4.abrupt("return", runQuery(sql, [id]));

            case 2:
            case "end":
              return _context4.stop();
          }
        }
      });
    } // ==========================
    // AUTO UPDATE STATUS (punya kamu)
    // ==========================

  }, {
    key: "autoUpdateStatus",
    value: function autoUpdateStatus() {
      return regeneratorRuntime.async(function autoUpdateStatus$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!isUpdating) {
                _context5.next = 2;
                break;
              }

              return _context5.abrupt("return");

            case 2:
              isUpdating = true;
              _context5.prev = 3;
              _context5.next = 6;
              return regeneratorRuntime.awrap(runQuery("\n        UPDATE reservasi r\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        SET r.status = 'selesai'\n        WHERE r.status = 'disetujui'\n          AND CONCAT(j.tanggal, ' ', j.jam_selesai) < NOW()\n      "));

            case 6:
              _context5.next = 8;
              return regeneratorRuntime.awrap(runQuery("\n        UPDATE reservasi r\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        SET r.status = 'booking',\n            j.status_slot = 'kosong'\n        WHERE r.status = 'menunggu'\n          AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20\n      "));

            case 8:
              _context5.next = 10;
              return regeneratorRuntime.awrap(runQuery("\n        UPDATE reservasi r\n        JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n        SET r.status = 'booking',\n            j.status_slot = 'kosong'\n        WHERE r.status = 'ditolak'\n          AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20\n      "));

            case 10:
              console.log('AUTO UPDATE OK');
              _context5.next = 16;
              break;

            case 13:
              _context5.prev = 13;
              _context5.t0 = _context5["catch"](3);
              console.error('AUTO UPDATE ERROR:', _context5.t0);

            case 16:
              isUpdating = false;

            case 17:
            case "end":
              return _context5.stop();
          }
        }
      }, null, null, [[3, 13]]);
    }
  }, {
    key: "isBusy",
    value: function isBusy() {
      return isUpdating;
    } // reject + free slot

  }, {
    key: "rejectAndFreeSlot",
    value: function rejectAndFreeSlot(id_reservasi) {
      var sql;
      return regeneratorRuntime.async(function rejectAndFreeSlot$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              sql = "\n      UPDATE reservasi r\n      JOIN jadwal j ON r.id_jadwal = j.id_jadwal\n      SET r.status = 'ditolak',\n          j.status_slot = 'kosong'\n      WHERE r.id_reservasi = ?\n    ";
              return _context6.abrupt("return", runQuery(sql, [id_reservasi]));

            case 2:
            case "end":
              return _context6.stop();
          }
        }
      });
    } // UPDATE & DELETE

  }, {
    key: "Update",
    value: function Update(id, data) {
      return regeneratorRuntime.async(function Update$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", runQuery('UPDATE reservasi SET ? WHERE id_reservasi = ?', [data, id]));

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
              return _context8.abrupt("return", runQuery('DELETE FROM reservasi WHERE id_reservasi = ?', [id]));

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
