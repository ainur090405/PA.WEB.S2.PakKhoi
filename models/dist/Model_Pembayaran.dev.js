"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_Pembayaran.js
var connection = require('../config/database'); // tambahan untuk notifikasi + log auto reject


var Model_Notifikasi = require('./Model_Notifikasi');

var Model_Reservasi = require('./Model_Reservasi');

var Model_Jadwal = require('./Model_Jadwal');

var _require = require('../helpers/logHelper'),
    createLog = _require.createLog; // helper kecil biar query pakai Promise


function runQuery(sql) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return new Promise(function (resolve, reject) {
    connection.query(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

var Model_Pembayaran =
/*#__PURE__*/
function () {
  function Model_Pembayaran() {
    _classCallCheck(this, Model_Pembayaran);
  }

  _createClass(Model_Pembayaran, null, [{
    key: "getAllWithUserArena",
    // ========================
    // BASIC GET / CRUD
    // ========================
    // Ambil semua pembayaran (untuk admin, join user & arena)
    value: function getAllWithUserArena() {
      var sql;
      return regeneratorRuntime.async(function getAllWithUserArena$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              sql = "\n      SELECT \n        p.*,\n        r.status AS status_reservasi,\n        u.nama AS nama_user,\n        a.nama_arena\n      FROM pembayaran p\n      JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n      JOIN users u ON r.id_user = u.id_user\n      JOIN arena a ON r.id_arena = a.id_arena\n      ORDER BY p.tanggal_pembayaran DESC\n    ";
              return _context.abrupt("return", runQuery(sql));

            case 2:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }, {
    key: "getById",
    value: function getById(id_pembayaran) {
      return regeneratorRuntime.async(function getById$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", runQuery('SELECT * FROM pembayaran WHERE id_pembayaran = ?', [id_pembayaran]));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // Ambil 1 pembayaran berdasarkan reservasi

  }, {
    key: "getByReservasi",
    value: function getByReservasi(id_reservasi) {
      return regeneratorRuntime.async(function getByReservasi$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", runQuery('SELECT * FROM pembayaran WHERE id_reservasi = ? LIMIT 1', [id_reservasi]));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    }
  }, {
    key: "Store",
    value: function Store(data) {
      return regeneratorRuntime.async(function Store$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO pembayaran SET ?', data, function (err, result) {
                  if (err) return reject(err);
                  resolve(result);
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
    value: function Update(id_pembayaran, data) {
      return regeneratorRuntime.async(function Update$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE pembayaran SET ? WHERE id_pembayaran = ?', [data, id_pembayaran], function (err, result) {
                  if (err) return reject(err);
                  resolve(result);
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
    value: function Delete(id_pembayaran) {
      return regeneratorRuntime.async(function Delete$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('DELETE FROM pembayaran WHERE id_pembayaran = ?', [id_pembayaran], function (err, result) {
                  if (err) return reject(err);
                  resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      });
    } // ========================
    // LOGIKA COD
    // ========================
    // Dipakai saat user pilih COD

  }, {
    key: "createCODByReservasi",
    value: function createCODByReservasi(id_reservasi, jumlah) {
      var data;
      return regeneratorRuntime.async(function createCODByReservasi$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              data = {
                id_reservasi: id_reservasi,
                metode_pembayaran: 'cod',
                // enum('cod','transaksi')
                status_pembayaran: 'unpaid',
                // default di DB juga 'unpaid'
                jumlah: jumlah,
                status_bukti: 'pending',
                konfirmasi_admin: false,
                tanggal_pembayaran: new Date(),
                created_at: new Date(),
                updated_at: new Date()
              };
              return _context7.abrupt("return", this.Store(data));

            case 2:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    } // ========================
    // LOGIKA TRANSFER (UPLOAD BUKTI)
    // ========================
    // Dipanggil ketika user upload bukti transfer

  }, {
    key: "uploadBuktiByReservasi",
    value: function uploadBuktiByReservasi(id_reservasi, filename) {
      return regeneratorRuntime.async(function uploadBuktiByReservasi$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", new Promise(function (resolve, reject) {
                var update = {
                  bukti_pembayaran: filename,
                  status_bukti: 'uploaded',
                  // enum('pending','uploaded')
                  status_pembayaran: 'pending',
                  // enum di tabel, kita pakai 'pending'
                  tanggal_pembayaran: new Date(),
                  konfirmasi_admin: false,
                  updated_at: new Date()
                };
                connection.query('UPDATE pembayaran SET ? WHERE id_reservasi = ?', [update, id_reservasi], function (err, result) {
                  if (err) return reject(err);

                  if (result.affectedRows === 0) {
                    // belum ada pembayaran → buat baru
                    var insert = {
                      id_reservasi: id_reservasi,
                      metode_pembayaran: 'transaksi',
                      status_pembayaran: 'pending',
                      status_bukti: 'uploaded',
                      bukti_pembayaran: filename,
                      jumlah: 0,
                      konfirmasi_admin: false,
                      tanggal_pembayaran: new Date(),
                      created_at: new Date(),
                      updated_at: new Date()
                    };
                    connection.query('INSERT INTO pembayaran SET ?', insert, function (err2, res2) {
                      if (err2) return reject(err2);
                      resolve(res2);
                    });
                  } else {
                    resolve(result);
                  }
                });
              }));

            case 1:
            case "end":
              return _context8.stop();
          }
        }
      });
    } // ========================
    // KONFIRMASI ADMIN
    // ========================

  }, {
    key: "confirmPaymentByReservasi",
    value: function confirmPaymentByReservasi(id_reservasi, status) {
      var catatan_admin,
          _args9 = arguments;
      return regeneratorRuntime.async(function confirmPaymentByReservasi$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              catatan_admin = _args9.length > 2 && _args9[2] !== undefined ? _args9[2] : null;
              return _context9.abrupt("return", new Promise(function (resolve, reject) {
                var data = {
                  status_pembayaran: status,
                  status_bukti: status === 'confirmed' || status === 'paid' ? 'uploaded' : undefined,
                  konfirmasi_admin: true,
                  catatan_admin: catatan_admin,
                  updated_at: new Date()
                };
                connection.query('UPDATE pembayaran SET ? WHERE id_reservasi = ?', [data, id_reservasi], function (err, result) {
                  if (err) return reject(err);
                  resolve(result);
                });
              }));

            case 2:
            case "end":
              return _context9.stop();
          }
        }
      });
    } // Pembayaran yang status_pembayaran masih 'pending' → untuk list verifikasi admin

  }, {
    key: "getPendingPayments",
    value: function getPendingPayments() {
      var sql;
      return regeneratorRuntime.async(function getPendingPayments$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              sql = "\n      SELECT \n        p.*,\n        r.status AS status_reservasi,\n        u.nama AS nama_user,\n        a.nama_arena\n      FROM pembayaran p\n      JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n      JOIN users u ON r.id_user = u.id_user\n      JOIN arena a ON r.id_arena = a.id_arena\n      WHERE p.status_pembayaran = 'pending'\n      ORDER BY p.tanggal_pembayaran ASC\n    ";
              return _context10.abrupt("return", runQuery(sql));

            case 2:
            case "end":
              return _context10.stop();
          }
        }
      });
    } // =====================================================
    // AUTO REJECT 1: tidak upload bukti 20 menit (transaksi)
    // =====================================================

  }, {
    key: "autoRejectNoProof",
    value: function autoRejectNoProof() {
      var rows, catatanDefault, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, row;

      return regeneratorRuntime.async(function autoRejectNoProof$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return regeneratorRuntime.awrap(runQuery("\n      SELECT\n        p.id_pembayaran,\n        p.id_reservasi,\n        p.status_pembayaran,\n        p.bukti_pembayaran,\n        r.id_user,\n        r.id_jadwal,\n        a.nama_arena,          -- \u2B05 ambil dari tabel arena\n        r.status       AS status_reservasi,\n        r.tanggal_pesan\n      FROM pembayaran p\n      JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n      JOIN arena a     ON r.id_arena     = a.id_arena\n      WHERE p.metode_pembayaran = 'transaksi'\n        AND (p.bukti_pembayaran IS NULL OR p.bukti_pembayaran = '')\n        AND p.status_pembayaran IN ('unpaid','pending')\n        AND TIMESTAMPDIFF(MINUTE, r.tanggal_pesan, NOW()) >= 20\n    "));

            case 2:
              rows = _context11.sent;

              if (rows.length) {
                _context11.next = 5;
                break;
              }

              return _context11.abrupt("return", 0);

            case 5:
              catatanDefault = 'Pembayaran ditolak (waktu upload bukti 20 menit habis).';
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context11.prev = 9;
              _iterator = rows[Symbol.iterator]();

            case 11:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context11.next = 35;
                break;
              }

              row = _step.value;
              _context11.next = 15;
              return regeneratorRuntime.awrap(runQuery("\n        UPDATE pembayaran p\n        JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n        JOIN jadwal j    ON r.id_jadwal    = j.id_jadwal\n        SET\n          p.status_pembayaran = 'rejected',\n          p.catatan_admin = COALESCE(p.catatan_admin, ?),\n          p.updated_at = NOW(),\n          r.status = 'ditolak',\n          j.status_slot = 'kosong'\n        WHERE p.id_pembayaran = ?\n      ", [catatanDefault, row.id_pembayaran]));

            case 15:
              _context11.prev = 15;
              _context11.next = 18;
              return regeneratorRuntime.awrap(createLog(row.id_reservasi, row.status_reservasi || 'menunggu', 'ditolak', 'Pembayaran otomatis ditolak karena batas waktu upload bukti (20 menit) telah habis.'));

            case 18:
              _context11.next = 23;
              break;

            case 20:
              _context11.prev = 20;
              _context11.t0 = _context11["catch"](15);
              console.warn('Gagal buat log autoRejectNoProof:', _context11.t0);

            case 23:
              _context11.prev = 23;

              if (!row.id_user) {
                _context11.next = 27;
                break;
              }

              _context11.next = 27;
              return regeneratorRuntime.awrap(Model_Notifikasi.Store({
                id_user: row.id_user,
                judul: 'Pembayaran Ditolak (Waktu Upload Habis)',
                isi_pesan: "Pembayaran Anda untuk arena ".concat(row.nama_arena || 'Arena', " ditolak karena batas waktu upload bukti (20 menit) telah habis dan data pembayaran tidak lengkap."),
                jenis_notif: 'status',
                tipe: 'payment',
                dibaca: 0
              }));

            case 27:
              _context11.next = 32;
              break;

            case 29:
              _context11.prev = 29;
              _context11.t1 = _context11["catch"](23);
              console.warn('Gagal kirim notif autoRejectNoProof:', _context11.t1);

            case 32:
              _iteratorNormalCompletion = true;
              _context11.next = 11;
              break;

            case 35:
              _context11.next = 41;
              break;

            case 37:
              _context11.prev = 37;
              _context11.t2 = _context11["catch"](9);
              _didIteratorError = true;
              _iteratorError = _context11.t2;

            case 41:
              _context11.prev = 41;
              _context11.prev = 42;

              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }

            case 44:
              _context11.prev = 44;

              if (!_didIteratorError) {
                _context11.next = 47;
                break;
              }

              throw _iteratorError;

            case 47:
              return _context11.finish(44);

            case 48:
              return _context11.finish(41);

            case 49:
              return _context11.abrupt("return", rows.length);

            case 50:
            case "end":
              return _context11.stop();
          }
        }
      }, null, null, [[9, 37, 41, 49], [15, 20], [23, 29], [42,, 44, 48]]);
    } // =====================================================
    // AUTO REJECT 2: sudah upload, admin tidak konfirmasi 20 menit
    // =====================================================

  }, {
    key: "autoRejectLateConfirmed",
    value: function autoRejectLateConfirmed() {
      var rows, catatanDefault, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, row;

      return regeneratorRuntime.async(function autoRejectLateConfirmed$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return regeneratorRuntime.awrap(runQuery("\n      SELECT\n        p.id_pembayaran,\n        p.id_reservasi,\n        p.status_pembayaran,\n        p.bukti_pembayaran,\n        p.updated_at,\n        r.id_user,\n        r.id_jadwal,\n        a.nama_arena,         -- \u2B05 ambil dari tabel arena\n        r.status AS status_reservasi\n      FROM pembayaran p\n      JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n      JOIN arena a     ON r.id_arena     = a.id_arena\n      WHERE p.metode_pembayaran = 'transaksi'\n        AND p.bukti_pembayaran IS NOT NULL\n        AND p.status_pembayaran IN ('unpaid','pending')\n        AND TIMESTAMPDIFF(MINUTE, p.updated_at, NOW()) >= 20\n    "));

            case 2:
              rows = _context12.sent;

              if (rows.length) {
                _context12.next = 5;
                break;
              }

              return _context12.abrupt("return", 0);

            case 5:
              catatanDefault = 'Pembayaran ditolak karena admin tidak mengkonfirmasi dalam batas waktu 20 menit.';
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context12.prev = 9;
              _iterator2 = rows[Symbol.iterator]();

            case 11:
              if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                _context12.next = 35;
                break;
              }

              row = _step2.value;
              _context12.next = 15;
              return regeneratorRuntime.awrap(runQuery("\n        UPDATE pembayaran p\n        JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n        JOIN jadwal j    ON r.id_jadwal    = j.id_jadwal\n        SET\n          p.status_pembayaran = 'rejected',\n          p.catatan_admin = COALESCE(p.catatan_admin, ?),\n          p.updated_at = NOW(),\n          r.status = 'ditolak',\n          j.status_slot = 'kosong'\n        WHERE p.id_pembayaran = ?\n      ", [catatanDefault, row.id_pembayaran]));

            case 15:
              _context12.prev = 15;
              _context12.next = 18;
              return regeneratorRuntime.awrap(createLog(row.id_reservasi, row.status_reservasi || 'menunggu', 'ditolak', 'Pembayaran otomatis ditolak karena tidak dikonfirmasi admin dalam 20 menit.'));

            case 18:
              _context12.next = 23;
              break;

            case 20:
              _context12.prev = 20;
              _context12.t0 = _context12["catch"](15);
              console.warn('Gagal buat log autoRejectLateConfirmed:', _context12.t0);

            case 23:
              _context12.prev = 23;

              if (!row.id_user) {
                _context12.next = 27;
                break;
              }

              _context12.next = 27;
              return regeneratorRuntime.awrap(Model_Notifikasi.Store({
                id_user: row.id_user,
                judul: 'Pembayaran Ditolak',
                isi_pesan: "Pembayaran Anda untuk arena ".concat(row.nama_arena || 'Arena', " ditolak karena admin tidak mengkonfirmasi pembayaran dalam batas waktu 20 menit."),
                jenis_notif: 'status',
                tipe: 'payment',
                dibaca: 0
              }));

            case 27:
              _context12.next = 32;
              break;

            case 29:
              _context12.prev = 29;
              _context12.t1 = _context12["catch"](23);
              console.warn('Gagal kirim notif autoRejectLateConfirmed:', _context12.t1);

            case 32:
              _iteratorNormalCompletion2 = true;
              _context12.next = 11;
              break;

            case 35:
              _context12.next = 41;
              break;

            case 37:
              _context12.prev = 37;
              _context12.t2 = _context12["catch"](9);
              _didIteratorError2 = true;
              _iteratorError2 = _context12.t2;

            case 41:
              _context12.prev = 41;
              _context12.prev = 42;

              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }

            case 44:
              _context12.prev = 44;

              if (!_didIteratorError2) {
                _context12.next = 47;
                break;
              }

              throw _iteratorError2;

            case 47:
              return _context12.finish(44);

            case 48:
              return _context12.finish(41);

            case 49:
              return _context12.abrupt("return", rows.length);

            case 50:
            case "end":
              return _context12.stop();
          }
        }
      }, null, null, [[9, 37, 41, 49], [15, 20], [23, 29], [42,, 44, 48]]);
    }
  }]);

  return Model_Pembayaran;
}();

module.exports = Model_Pembayaran;
//# sourceMappingURL=Model_Pembayaran.dev.js.map
