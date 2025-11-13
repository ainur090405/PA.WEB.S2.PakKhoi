"use strict";

// routes/reservasi.js
var express = require('express');

var router = express.Router();

var Model_Reservasi = require('../models/Model_Reservasi');

var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isAdmin = _require.isAdmin; // Lindungi semua rute, hanya Admin


router.use(isAuthenticated, isAdmin); // GET: Tampilkan daftar reservasi

router.get('/', function _callee(req, res) {
  var reservasi;
  return regeneratorRuntime.async(function _callee$(_context) {
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
          console.error(_context.t0); // Tampilkan error di console

          req.flash('error_msg', 'Gagal memuat data reservasi.');
          res.redirect('/admin/dashboard');

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // GET: Form edit reservasi (untuk ubah status)

router.get('/edit/:id', function _callee2(req, res) {
  var id, reservasiData;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          id = req.params.id;
          _context2.next = 4;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id));

        case 4:
          reservasiData = _context2.sent;

          if (!(reservasiData.length === 0)) {
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
          _context2.next = 15;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          req.flash('error_msg', 'Gagal memuat data reservasi.');
          res.redirect('/reservasi');

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // POST: Update reservasi

router.post('/update/:id', function _callee3(req, res) {
  var id, _req$body, status, catatan, dataToUpdate, Model_Notifikasi, reservasiData, notifData;

  return regeneratorRuntime.async(function _callee3$(_context3) {
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
          if (!(status === 'disetujui' || status === 'selesai')) {
            _context3.next = 15;
            break;
          }

          Model_Notifikasi = require('../models/Model_Notifikasi_new');
          _context3.next = 10;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id));

        case 10:
          reservasiData = _context3.sent;

          if (!(reservasiData.length > 0)) {
            _context3.next = 15;
            break;
          }

          notifData = {
            id_user: reservasiData[0].id_user,
            judul: status === 'disetujui' ? 'Booking Disetujui' : 'Booking Selesai',
            pesan: "Booking Anda untuk arena ".concat(reservasiData[0].nama_arena, " telah ").concat(status === 'disetujui' ? 'disetujui' : 'selesai', "."),
            tipe: 'booking',
            dibaca: 0
          };
          _context3.next = 15;
          return regeneratorRuntime.awrap(Model_Notifikasi.Store(notifData));

        case 15:
          req.flash('success_msg', 'Status reservasi berhasil diperbarui.');
          res.redirect('/admin/reservasi'); // ✅ FIX

          _context3.next = 23;
          break;

        case 19:
          _context3.prev = 19;
          _context3.t0 = _context3["catch"](1);
          req.flash('error_msg', 'Gagal memperbarui reservasi: ' + _context3.t0.code);
          res.redirect('/admin/reservasi/edit/' + id); // ✅ FIX

        case 23:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 19]]);
}); // GET: Hapus reservasi

router.get('/delete/:id', function _callee4(req, res) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(Model_Reservasi.Delete(req.params.id));

        case 3:
          req.flash('success_msg', 'Data reservasi berhasil dihapus.');
          res.redirect('/reservasi');
          _context4.next = 11;
          break;

        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](0);
          req.flash('error_msg', 'Gagal menghapus reservasi: ' + _context4.t0.code);
          res.redirect('/reservasi');

        case 11:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // GET: Download reservasi data as CSV

router.get('/download', function _callee5(req, res) {
  var reservasi, csv;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(Model_Reservasi.getAll());

        case 3:
          reservasi = _context5.sent;
          csv = 'ID,Pemesan,Arena,Tanggal Main,Jam,Tanggal Pesan,Status,Pembayaran,Jumlah\n';
          reservasi.forEach(function (r) {
            csv += "".concat(r.id_reservasi, ",").concat(r.nama_user, ",").concat(r.nama_arena, ",").concat(new Date(r.tanggal).toLocaleDateString('id-ID'), ",").concat(r.jam_mulai.substring(0, 5), ",").concat(new Date(r.tanggal_pesan).toLocaleDateString('id-ID'), ",").concat(r.status, ",").concat(r.payment_method || '', ",").concat(r.amount || 0, "\n");
          });
          res.header('Content-Type', 'text/csv');
          res.attachment('reservasi.csv');
          res.send(csv);
          _context5.next = 16;
          break;

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          console.error(_context5.t0);
          req.flash('error_msg', 'Gagal mendownload data reservasi.');
          res.redirect('/reservasi');

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;
//# sourceMappingURL=reservasi_new.dev.js.map
