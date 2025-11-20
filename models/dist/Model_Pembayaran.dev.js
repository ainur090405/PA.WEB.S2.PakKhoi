"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_Pembayaran.js
var connection = require('../config/database');

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
      return regeneratorRuntime.async(function getAllWithUserArena$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT \n          p.*,\n          r.status AS status_reservasi,\n          u.nama AS nama_user,\n          a.nama_arena\n        FROM pembayaran p\n        JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n        JOIN users u ON r.id_user = u.id_user\n        JOIN arena a ON r.id_arena = a.id_arena\n        ORDER BY p.tanggal_pembayaran DESC\n      ";
                connection.query(sql, function (err, rows) {
                  if (err) return reject(err);
                  resolve(rows);
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
    value: function getById(id_pembayaran) {
      return regeneratorRuntime.async(function getById$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM pembayaran WHERE id_pembayaran = ?', [id_pembayaran], function (err, rows) {
                  if (err) return reject(err);
                  resolve(rows);
                });
              }));

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
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM pembayaran WHERE id_reservasi = ? LIMIT 1', [id_reservasi], function (err, rows) {
                  if (err) return reject(err);
                  resolve(rows);
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
                  // enum('pending','uploaded','paid','confirmed','unpaid')
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
                      // sesuai enum di tabel
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

    /**
     * status:
     *   - 'confirmed' → pembayaran fix (bisa untuk COD atau transfer)
     *   - 'paid'      → COD sudah dibayar tapi belum final, terserah flow-mu
     *   - 'unpaid'    → belum bayar (COD)
     *   - 'uploaded'  → jarang dipakai, kita pakai status_bukti utk ini
     *
     * Catatan: JANGAN gunakan 'rejected' karena tidak ada di enum status_pembayaran.
     */

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
                  // status_bukti hanya relevan untuk transfer
                  status_bukti: status === 'confirmed' || status === 'paid' ? 'uploaded' // bukti tetap 'uploaded'
                  : undefined,
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
      return regeneratorRuntime.async(function getPendingPayments$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "\n        SELECT \n          p.*,\n          r.status AS status_reservasi,\n          u.nama AS nama_user,\n          a.nama_arena\n        FROM pembayaran p\n        JOIN reservasi r ON p.id_reservasi = r.id_reservasi\n        JOIN users u ON r.id_user = u.id_user\n        JOIN arena a ON r.id_arena = a.id_arena\n        WHERE p.status_pembayaran = 'pending'\n        ORDER BY p.tanggal_pembayaran ASC\n      ";
                connection.query(sql, function (err, rows) {
                  if (err) return reject(err);
                  resolve(rows);
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

  return Model_Pembayaran;
}();

module.exports = Model_Pembayaran;
//# sourceMappingURL=Model_Pembayaran.dev.js.map
