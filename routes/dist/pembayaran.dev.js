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
  var id_pembayaran, catatan_admin, pembayaranData, reservasiData, Model_Jadwal, Model_Notifikasi, notifData;
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
            _context2.next = 29;
            break;
          }

          _context2.next = 11;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(pembayaranData[0].id_reservasi, {
            status: 'disetujui'
          }));

        case 11:
          _context2.next = 13;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(pembayaranData[0].id_reservasi));

        case 13:
          reservasiData = _context2.sent;

          if (!(reservasiData.length > 0)) {
            _context2.next = 18;
            break;
          }

          Model_Jadwal = require('../models/Model_Jadwal');
          _context2.next = 18;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(reservasiData[0].id_jadwal, {
            status_slot: 'terisi'
          }));

        case 18:
          if (!(pembayaranData[0] && pembayaranData[0].id_user && typeof pembayaranData[0].id_user === 'number' && pembayaranData[0].id_user > 0)) {
            _context2.next = 29;
            break;
          }

          _context2.prev = 19;
          Model_Notifikasi = require('../models/Model_Notifikasi');
          notifData = {
            id_user: pembayaranData[0].id_user,
            judul: 'Pembayaran Dikonfirmasi',
            isi_pesan: "Pembayaran Anda untuk arena ".concat(pembayaranData[0].nama_arena || 'Arena', " telah dikonfirmasi. Booking Anda sekarang aktif."),
            jenis_notif: 'status',
            tipe: 'payment',
            dibaca: 0
          };
          _context2.next = 24;
          return regeneratorRuntime.awrap(Model_Notifikasi.Store(notifData));

        case 24:
          _context2.next = 29;
          break;

        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](19);
          console.error('Failed to send notification:', _context2.t0); // Continue with confirmation even if notification fails

        case 29:
          req.flash('success_msg', 'Pembayaran berhasil dikonfirmasi.');
          res.redirect('/admin/pembayaran');
          _context2.next = 38;
          break;

        case 33:
          _context2.prev = 33;
          _context2.t1 = _context2["catch"](0);
          console.error(_context2.t1);
          req.flash('error_msg', 'Gagal mengkonfirmasi pembayaran.');
          res.redirect('/admin/pembayaran');

        case 38:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 33], [19, 26]]);
}); // POST: Konfirmasi COD (tanpa redirect, hanya flash message)

router.post('/confirm-cod/:id', function _callee3(req, res) {
  var id_pembayaran, pembayaranData, reservasiData, Model_Jadwal, Model_Notifikasi, notifData;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          id_pembayaran = req.params.id; // Konfirmasi pembayaran COD

          _context3.next = 4;
          return regeneratorRuntime.awrap(Model_Pembayaran.confirmPayment(id_pembayaran, 'confirmed', 'COD - Pembayaran diterima langsung'));

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(Model_Pembayaran.getById(id_pembayaran));

        case 6:
          pembayaranData = _context3.sent;

          if (!(pembayaranData.length > 0)) {
            _context3.next = 28;
            break;
          }

          _context3.next = 10;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(pembayaranData[0].id_reservasi, {
            status: 'disetujui'
          }));

        case 10:
          _context3.next = 12;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(pembayaranData[0].id_reservasi));

        case 12:
          reservasiData = _context3.sent;

          if (!(reservasiData.length > 0)) {
            _context3.next = 17;
            break;
          }

          Model_Jadwal = require('../models/Model_Jadwal');
          _context3.next = 17;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(reservasiData[0].id_jadwal, {
            status_slot: 'terisi'
          }));

        case 17:
          if (!(pembayaranData[0] && pembayaranData[0].id_user && typeof pembayaranData[0].id_user === 'number' && pembayaranData[0].id_user > 0)) {
            _context3.next = 28;
            break;
          }

          _context3.prev = 18;
          Model_Notifikasi = require('../models/Model_Notifikasi');
          notifData = {
            id_user: pembayaranData[0].id_user,
            judul: 'Pembayaran COD Dikonfirmasi',
            isi_pesan: "Pembayaran COD Anda untuk arena ".concat(pembayaranData[0].nama_arena || 'Arena', " telah dikonfirmasi. Booking Anda sekarang aktif."),
            jenis_notif: 'status',
            tipe: 'payment',
            dibaca: 0
          };
          _context3.next = 23;
          return regeneratorRuntime.awrap(Model_Notifikasi.Store(notifData));

        case 23:
          _context3.next = 28;
          break;

        case 25:
          _context3.prev = 25;
          _context3.t0 = _context3["catch"](18);
          console.error('Failed to send notification:', _context3.t0);

        case 28:
          // Return JSON response untuk AJAX
          res.json({
            success: true,
            message: 'Pembayaran COD berhasil dikonfirmasi!'
          });
          _context3.next = 35;
          break;

        case 31:
          _context3.prev = 31;
          _context3.t1 = _context3["catch"](0);
          console.error(_context3.t1); // Return JSON error response untuk AJAX, bukan redirect

          res.status(500).json({
            success: false,
            message: 'Gagal mengkonfirmasi pembayaran COD. Silakan coba lagi.'
          });

        case 35:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 31], [18, 25]]);
}); // POST: Tolak pembayaran

router.post('/reject/:id', function _callee4(req, res) {
  var id_pembayaran, catatan_admin, pembayaranData, Model_Notifikasi, notifData;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          id_pembayaran = req.params.id;
          catatan_admin = req.body.catatan_admin; // Update status pembayaran menjadi 'rejected'

          _context4.next = 5;
          return regeneratorRuntime.awrap(Model_Pembayaran.confirmPayment(id_pembayaran, 'rejected', catatan_admin));

        case 5:
          _context4.next = 7;
          return regeneratorRuntime.awrap(Model_Pembayaran.getById(id_pembayaran));

        case 7:
          pembayaranData = _context4.sent;

          if (!(pembayaranData.length > 0)) {
            _context4.next = 22;
            break;
          }

          _context4.next = 11;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(pembayaranData[0].id_reservasi, {
            status: 'ditolak'
          }));

        case 11:
          if (!(pembayaranData[0] && pembayaranData[0].id_user && typeof pembayaranData[0].id_user === 'number' && pembayaranData[0].id_user > 0)) {
            _context4.next = 22;
            break;
          }

          _context4.prev = 12;
          Model_Notifikasi = require('../models/Model_Notifikasi');
          notifData = {
            id_user: pembayaranData[0].id_user,
            judul: 'Pembayaran Ditolak',
            isi_pesan: "Pembayaran Anda untuk arena ".concat(pembayaranData[0].nama_arena || 'Arena', " ditolak. ").concat(catatan_admin),
            jenis_notif: 'status',
            tipe: 'payment',
            dibaca: 0
          };
          _context4.next = 17;
          return regeneratorRuntime.awrap(Model_Notifikasi.Store(notifData));

        case 17:
          _context4.next = 22;
          break;

        case 19:
          _context4.prev = 19;
          _context4.t0 = _context4["catch"](12);
          console.error('Failed to send notification:', _context4.t0); // Continue with rejection even if notification fails

        case 22:
          req.flash('error_msg', 'Pembayaran berhasil ditolak.');
          res.redirect('/admin/pembayaran');
          _context4.next = 31;
          break;

        case 26:
          _context4.prev = 26;
          _context4.t1 = _context4["catch"](0);
          console.error(_context4.t1);
          req.flash('error_msg', 'Gagal menolak pembayaran.');
          res.redirect('/admin/pembayaran');

        case 31:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 26], [12, 19]]);
});
module.exports = router;
//# sourceMappingURL=pembayaran.dev.js.map
