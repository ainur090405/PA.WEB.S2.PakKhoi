"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// controllers/ReservasiController.js
var Model_Reservasi = require('../models/Model_Reservasi');

var ReservasiController =
/*#__PURE__*/
function () {
  function ReservasiController() {
    _classCallCheck(this, ReservasiController);
  }

  _createClass(ReservasiController, null, [{
    key: "index",
    // GET: daftar semua reservasi
    value: function index(req, res) {
      var reservasi;
      return regeneratorRuntime.async(function index$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return regeneratorRuntime.awrap(Model_Reservasi.getAll());

            case 3:
              reservasi = _context.sent;
              res.render('admin/reservasi/index', {
                title: 'Manajemen Reservasi',
                data: reservasi
              });
              _context.next = 12;
              break;

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              console.error('[ReservasiController.index]', _context.t0);
              req.flash('error_msg', 'Gagal memuat data reservasi.');
              res.redirect('/admin/dashboard');

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, null, null, [[0, 7]]);
    } // GET: form edit

  }, {
    key: "edit",
    value: function edit(req, res) {
      var id, reservasiData;
      return regeneratorRuntime.async(function edit$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              id = req.params.id;
              _context2.next = 4;
              return regeneratorRuntime.awrap(Model_Reservasi.getById(id));

            case 4:
              reservasiData = _context2.sent;

              if (!(!reservasiData || reservasiData.length === 0)) {
                _context2.next = 8;
                break;
              }

              req.flash('error_msg', 'Reservasi tidak ditemukan.');
              return _context2.abrupt("return", res.redirect('/reservasi'));

            case 8:
              res.render('admin/reservasi/edit', {
                title: 'Update Status Reservasi',
                reservasi: reservasiData[0]
              });
              _context2.next = 16;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](0);
              console.error('[ReservasiController.edit]', _context2.t0);
              req.flash('error_msg', 'Gagal memuat data reservasi.');
              res.redirect('/reservasi');

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, null, null, [[0, 11]]);
    } // POST: update status

  }, {
    key: "update",
    value: function update(req, res) {
      var id, _req$body, status, catatan, dataToUpdate;

      return regeneratorRuntime.async(function update$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              id = req.params.id;
              _context3.prev = 1;
              _req$body = req.body, status = _req$body.status, catatan = _req$body.catatan;
              dataToUpdate = {
                status: status,
                catatan: catatan
              };
              _context3.next = 6;
              return regeneratorRuntime.awrap(Model_Reservasi.Update(id, dataToUpdate));

            case 6:
              req.flash('success_msg', 'Status reservasi berhasil diperbarui.');
              res.redirect('/reservasi');
              _context3.next = 15;
              break;

            case 10:
              _context3.prev = 10;
              _context3.t0 = _context3["catch"](1);
              console.error('[ReservasiController.update]', _context3.t0);
              req.flash('error_msg', 'Gagal memperbarui reservasi.');
              res.redirect("/reservasi/edit/".concat(id));

            case 15:
            case "end":
              return _context3.stop();
          }
        }
      }, null, null, [[1, 10]]);
    } // GET: hapus reservasi

  }, {
    key: "delete",
    value: function _delete(req, res) {
      var id;
      return regeneratorRuntime.async(function _delete$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              id = req.params.id;
              _context4.next = 4;
              return regeneratorRuntime.awrap(Model_Reservasi.Delete(id));

            case 4:
              req.flash('success_msg', 'Data reservasi berhasil dihapus.');
              res.redirect('/reservasi');
              _context4.next = 13;
              break;

            case 8:
              _context4.prev = 8;
              _context4.t0 = _context4["catch"](0);
              console.error('[ReservasiController.delete]', _context4.t0);
              req.flash('error_msg', 'Gagal menghapus reservasi.');
              res.redirect('/reservasi');

            case 13:
            case "end":
              return _context4.stop();
          }
        }
      }, null, null, [[0, 8]]);
    }
  }]);

  return ReservasiController;
}();

module.exports = ReservasiController;
//# sourceMappingURL=ReservasiController.dev.js.map
