"use strict";

var express = require('express');

var router = express.Router();

var Model_Pembayaran = require('../models/Model_Pembayaran');

var Model_Reservasi = require('../models/Model_Reservasi');

var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isAdmin = _require.isAdmin; // Lindungi semua rute, hanya Admin


router.use(isAuthenticated, isAdmin); // GET: Tampilkan daftar pembayaran yang pending

router.get('/', function _callee(req, res) {
  var pembayaran;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Model_Pembayaran.getPendingPayments());

        case 3:
          pembayaran = _context.sent;
          res.render('admin/pembayaran/index', {
            title: 'Konfirmasi Pembayaran',
            data: pembayaran
          });
          _context.next = 12;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          req.flash('error_msg', 'Gagal memuat data pembayaran.');
          res.redirect('/admin/dashboard');

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // POST: Konfirmasi pembayaran

router.post('/confirm/:id', function _callee2(req, res) {
  var id_pembayaran, catatan_admin, pembayaranData, Model_Notifikasi, notifData;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          id_pembayaran = req.params.id;
          catatan_admin = req.body.catatan_admin; // Konfirmasi pembayaran

          _context2.next = 5;
          return regeneratorRuntime.awrap(Model_Pembayaran.confirmPayment(id_pembayaran, 'confirmed', catatan_admin));

        case 5:
          _context2.next = 7;
          return regeneratorRuntime.awrap(Model_Pembayaran.getById(id_pembayaran));

        case 7:
          pembayaranData = _context2.sent;

          if (!(pembayaranData.length > 0)) {
            _context2.next = 15;
            break;
          }

          _context2.next = 11;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(pembayaranData[0].id_reservasi, {
            status: 'disetujui'
          }));

        case 11:
          // Kirim notifikasi ke pemain
          Model_Notifikasi = require('../models/Model_Notifikasi_new');
          notifData = {
            id_user: pembayaranData[0].id_user,
            judul: 'Pembayaran Dikonfirmasi',
            pesan: "Pembayaran Anda untuk arena ".concat(pembayaranData[0].nama_arena, " telah dikonfirmasi."),
            tipe: 'payment',
            dibaca: 0
          };
          _context2.next = 15;
          return regeneratorRuntime.awrap(Model_Notifikasi.Store(notifData));

        case 15:
          req.flash('success_msg', 'Pembayaran berhasil dikonfirmasi.');
          res.redirect('/admin/pembayaran');
          _context2.next = 24;
          break;

        case 19:
          _context2.prev = 19;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          req.flash('error_msg', 'Gagal mengkonfirmasi pembayaran.');
          res.redirect('/admin/pembayaran');

        case 24:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 19]]);
}); // POST: Tolak pembayaran

router.post('/reject/:id', function _callee3(req, res) {
  var id_pembayaran, catatan_admin, pembayaranData, Model_Notifikasi, notifData;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          id_pembayaran = req.params.id;
          catatan_admin = req.body.catatan_admin; // Update status pembayaran menjadi 'rejected'

          _context3.next = 5;
          return regeneratorRuntime.awrap(Model_Pembayaran.confirmPayment(id_pembayaran, 'rejected', catatan_admin));

        case 5:
          _context3.next = 7;
          return regeneratorRuntime.awrap(Model_Pembayaran.getById(id_pembayaran));

        case 7:
          pembayaranData = _context3.sent;

          if (!(pembayaranData.length > 0)) {
            _context3.next = 15;
            break;
          }

          _context3.next = 11;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(pembayaranData[0].id_reservasi, {
            status: 'ditolak'
          }));

        case 11:
          // Kirim notifikasi ke pemain
          Model_Notifikasi = require('../models/Model_Notifikasi_new');
          notifData = {
            id_user: pembayaranData[0].id_user,
            judul: 'Pembayaran Ditolak',
            pesan: "Pembayaran Anda untuk arena ".concat(pembayaranData[0].nama_arena, " ditolak. ").concat(catatan_admin),
            tipe: 'payment',
            dibaca: 0
          };
          _context3.next = 15;
          return regeneratorRuntime.awrap(Model_Notifikasi.Store(notifData));

        case 15:
          req.flash('error_msg', 'Pembayaran berhasil ditolak.');
          res.redirect('/admin/pembayaran');
          _context3.next = 24;
          break;

        case 19:
          _context3.prev = 19;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          req.flash('error_msg', 'Gagal menolak pembayaran.');
          res.redirect('/admin/pembayaran');

        case 24:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 19]]);
});
module.exports = router;
//# sourceMappingURL=pembayaran_new.dev.js.map
