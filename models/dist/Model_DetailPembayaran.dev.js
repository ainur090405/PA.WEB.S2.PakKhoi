"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Model_Pembayaran = require('./Model_Pembayaran');

var Model_DetailPembayaran =
/*#__PURE__*/
function () {
  function Model_DetailPembayaran() {
    _classCallCheck(this, Model_DetailPembayaran);
  }

  _createClass(Model_DetailPembayaran, null, [{
    key: "getByReservasi",
    // Kembalikan "detail" berdasarkan id_reservasi
    // Format array 1 elemen, mirip hasil query dulu.
    value: function getByReservasi(id_reservasi) {
      var rows, p;
      return regeneratorRuntime.async(function getByReservasi$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(Model_Pembayaran.getByReservasi(id_reservasi));

            case 2:
              rows = _context.sent;

              if (!(!rows || rows.length === 0)) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return", []);

            case 5:
              p = rows[0];
              return _context.abrupt("return", [{
                id_detail: p.id_pembayaran,
                id_reservasi: p.id_reservasi,
                metode_pembayaran: p.metode_pembayaran,
                status_pembayaran: p.status_pembayaran,
                bukti_pembayaran: p.bukti_pembayaran,
                status_bukti: p.status_bukti,
                catatan_admin: p.catatan_admin,
                konfirmasi_admin: p.konfirmasi_admin,
                created_at: p.created_at,
                updated_at: p.updated_at
              }]);

            case 7:
            case "end":
              return _context.stop();
          }
        }
      });
    } // create detail = insert pembayaran

  }, {
    key: "create",
    value: function create(data) {
      var insert;
      return regeneratorRuntime.async(function create$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              insert = {
                id_reservasi: data.id_reservasi,
                metode_pembayaran: data.metode_pembayaran || 'transaksi',
                status_pembayaran: data.status_pembayaran || 'unpaid',
                bukti_pembayaran: data.bukti_pembayaran || null,
                status_bukti: data.status_bukti || 'pending',
                catatan_admin: data.catatan_admin || null,
                konfirmasi_admin: data.konfirmasi_admin || false,
                created_at: new Date(),
                updated_at: new Date()
              };
              return _context2.abrupt("return", Model_Pembayaran.Store(insert));

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // updateByReservasi = update row pembayaran

  }, {
    key: "updateByReservasi",
    value: function updateByReservasi(id_reservasi, data) {
      var rows, mapped, insert;
      return regeneratorRuntime.async(function updateByReservasi$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(Model_Pembayaran.getByReservasi(id_reservasi));

            case 2:
              rows = _context3.sent;
              mapped = {};
              if (data.metode_pembayaran !== undefined) mapped.metode_pembayaran = data.metode_pembayaran;
              if (data.status_pembayaran !== undefined) mapped.status_pembayaran = data.status_pembayaran;
              if (data.bukti_pembayaran !== undefined) mapped.bukti_pembayaran = data.bukti_pembayaran;
              if (data.status_bukti !== undefined) mapped.status_bukti = data.status_bukti;
              if (data.catatan_admin !== undefined) mapped.catatan_admin = data.catatan_admin;
              if (data.konfirmasi_admin !== undefined) mapped.konfirmasi_admin = data.konfirmasi_admin;
              mapped.updated_at = new Date();

              if (!(!rows || rows.length === 0)) {
                _context3.next = 16;
                break;
              }

              insert = Object.assign({
                id_reservasi: id_reservasi,
                created_at: new Date()
              }, mapped);
              return _context3.abrupt("return", Model_Pembayaran.Store(insert));

            case 16:
              return _context3.abrupt("return", Model_Pembayaran.Update(rows[0].id_pembayaran, mapped));

            case 17:
            case "end":
              return _context3.stop();
          }
        }
      });
    } // upsertBukti → pakai uploadBuktiByReservasi

  }, {
    key: "upsertBukti",
    value: function upsertBukti(id_reservasi, filename) {
      return regeneratorRuntime.async(function upsertBukti$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", Model_Pembayaran.uploadBuktiByReservasi(id_reservasi, filename));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      });
    }
  }]);

  return Model_DetailPembayaran;
}();

module.exports = Model_DetailPembayaran;
//# sourceMappingURL=Model_DetailPembayaran.dev.js.map
