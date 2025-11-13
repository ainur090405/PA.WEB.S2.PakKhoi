"use strict";

// routes/ulasan.js
var express = require('express');

var router = express.Router();

var Model_Ulasan = require('../models/Model_Ulasan');

var Model_Reservasi = require('../models/Model_Reservasi');

var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isPemain = _require.isPemain; // Middleware untuk pemain yang login


router.use(isAuthenticated, isPemain); // GET: Form tambah ulasan

router.get('/create/:id_reservasi', function _callee(req, res) {
  var id_reservasi, userId, reservasiData, reservasi, existingReview;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          id_reservasi = req.params.id_reservasi;
          userId = req.session.user.id;
          _context.next = 5;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

        case 5:
          reservasiData = _context.sent;

          if (!(reservasiData.length === 0)) {
            _context.next = 9;
            break;
          }

          req.flash('error_msg', 'Reservasi tidak ditemukan.');
          return _context.abrupt("return", res.redirect('/pemain/profile'));

        case 9:
          reservasi = reservasiData[0];

          if (!(reservasi.id_user !== userId)) {
            _context.next = 13;
            break;
          }

          req.flash('error_msg', 'Anda tidak memiliki akses ke reservasi ini.');
          return _context.abrupt("return", res.redirect('/pemain/profile'));

        case 13:
          if (!(reservasi.status !== 'selesai')) {
            _context.next = 16;
            break;
          }

          req.flash('error_msg', 'Anda hanya bisa memberikan ulasan untuk reservasi yang sudah selesai.');
          return _context.abrupt("return", res.redirect('/pemain/profile'));

        case 16:
          _context.next = 18;
          return regeneratorRuntime.awrap(Model_Ulasan.getByReservasi(id_reservasi));

        case 18:
          existingReview = _context.sent;

          if (!(existingReview.length > 0)) {
            _context.next = 22;
            break;
          }

          req.flash('error_msg', 'Anda sudah memberikan ulasan untuk reservasi ini.');
          return _context.abrupt("return", res.redirect('/pemain/profile'));

        case 22:
          res.render('pemain/ulasan/create', {
            title: 'Beri Ulasan',
            reservasi: reservasi
          });
          _context.next = 30;
          break;

        case 25:
          _context.prev = 25;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          req.flash('error_msg', 'Gagal memuat halaman ulasan.');
          res.redirect('/pemain/profile');

        case 30:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 25]]);
}); // POST: Simpan ulasan

router.post('/create/:id_reservasi', function _callee2(req, res) {
  var id_reservasi, userId, _req$body, rating, komentar, existingReview, dataUlasan;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          id_reservasi = req.params.id_reservasi;
          userId = req.session.user.id;
          _req$body = req.body, rating = _req$body.rating, komentar = _req$body.komentar;

          if (!(!rating || rating < 1 || rating > 5)) {
            _context2.next = 7;
            break;
          }

          req.flash('error_msg', 'Rating harus antara 1-5.');
          return _context2.abrupt("return", res.redirect('back'));

        case 7:
          _context2.next = 9;
          return regeneratorRuntime.awrap(Model_Ulasan.getByReservasi(id_reservasi));

        case 9:
          existingReview = _context2.sent;

          if (!(existingReview.length > 0)) {
            _context2.next = 13;
            break;
          }

          req.flash('error_msg', 'Anda sudah memberikan ulasan untuk reservasi ini.');
          return _context2.abrupt("return", res.redirect('/pemain/profile'));

        case 13:
          dataUlasan = {
            id_user: userId,
            id_reservasi: id_reservasi,
            rating: parseInt(rating),
            komentar: komentar || null
          };
          _context2.next = 16;
          return regeneratorRuntime.awrap(Model_Ulasan.Store(dataUlasan));

        case 16:
          req.flash('success_msg', 'Terima kasih atas ulasan Anda!');
          res.redirect('/pemain/profile');
          _context2.next = 25;
          break;

        case 20:
          _context2.prev = 20;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          req.flash('error_msg', 'Gagal menyimpan ulasan.');
          res.redirect('back');

        case 25:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 20]]);
}); // GET: Edit ulasan

router.get('/edit/:id_reservasi', function _callee3(req, res) {
  var id_reservasi, userId, ulasanData, ulasan, reservasiData, reservasi;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          id_reservasi = req.params.id_reservasi;
          userId = req.session.user.id;
          _context3.next = 5;
          return regeneratorRuntime.awrap(Model_Ulasan.getByReservasi(id_reservasi));

        case 5:
          ulasanData = _context3.sent;

          if (!(ulasanData.length === 0)) {
            _context3.next = 9;
            break;
          }

          req.flash('error_msg', 'Ulasan tidak ditemukan.');
          return _context3.abrupt("return", res.redirect('/pemain/profile'));

        case 9:
          ulasan = ulasanData[0];

          if (!(ulasan.id_user !== userId)) {
            _context3.next = 13;
            break;
          }

          req.flash('error_msg', 'Anda tidak memiliki akses ke ulasan ini.');
          return _context3.abrupt("return", res.redirect('/pemain/profile'));

        case 13:
          _context3.next = 15;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

        case 15:
          reservasiData = _context3.sent;
          reservasi = reservasiData[0];
          res.render('pemain/ulasan/edit', {
            title: 'Edit Ulasan',
            ulasan: ulasan,
            reservasi: reservasi
          });
          _context3.next = 25;
          break;

        case 20:
          _context3.prev = 20;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          req.flash('error_msg', 'Gagal memuat halaman edit ulasan.');
          res.redirect('/pemain/profile');

        case 25:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 20]]);
}); // POST: Update ulasan

router.post('/update/:id_reservasi', function _callee4(req, res) {
  var id_reservasi, userId, _req$body2, rating, komentar, ulasanData, dataUpdate;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          id_reservasi = req.params.id_reservasi;
          userId = req.session.user.id;
          _req$body2 = req.body, rating = _req$body2.rating, komentar = _req$body2.komentar;

          if (!(!rating || rating < 1 || rating > 5)) {
            _context4.next = 7;
            break;
          }

          req.flash('error_msg', 'Rating harus antara 1-5.');
          return _context4.abrupt("return", res.redirect('back'));

        case 7:
          _context4.next = 9;
          return regeneratorRuntime.awrap(Model_Ulasan.getByReservasi(id_reservasi));

        case 9:
          ulasanData = _context4.sent;

          if (!(ulasanData.length === 0 || ulasanData[0].id_user !== userId)) {
            _context4.next = 13;
            break;
          }

          req.flash('error_msg', 'Ulasan tidak ditemukan atau Anda tidak memiliki akses.');
          return _context4.abrupt("return", res.redirect('/pemain/profile'));

        case 13:
          dataUpdate = {
            rating: parseInt(rating),
            komentar: komentar || null
          };
          _context4.next = 16;
          return regeneratorRuntime.awrap(Model_Ulasan.Update(id_reservasi, dataUpdate));

        case 16:
          req.flash('success_msg', 'Ulasan berhasil diperbarui!');
          res.redirect('/pemain/profile');
          _context4.next = 25;
          break;

        case 20:
          _context4.prev = 20;
          _context4.t0 = _context4["catch"](0);
          console.error(_context4.t0);
          req.flash('error_msg', 'Gagal memperbarui ulasan.');
          res.redirect('back');

        case 25:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 20]]);
}); // POST: Hapus ulasan

router.post('/delete/:id_reservasi', function _callee5(req, res) {
  var id_reservasi, userId, ulasanData;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          id_reservasi = req.params.id_reservasi;
          userId = req.session.user.id;
          _context5.next = 5;
          return regeneratorRuntime.awrap(Model_Ulasan.getByReservasi(id_reservasi));

        case 5:
          ulasanData = _context5.sent;

          if (!(ulasanData.length === 0 || ulasanData[0].id_user !== userId)) {
            _context5.next = 9;
            break;
          }

          req.flash('error_msg', 'Ulasan tidak ditemukan atau Anda tidak memiliki akses.');
          return _context5.abrupt("return", res.redirect('/pemain/profile'));

        case 9:
          _context5.next = 11;
          return regeneratorRuntime.awrap(Model_Ulasan.Delete(id_reservasi));

        case 11:
          req.flash('success_msg', 'Ulasan berhasil dihapus.');
          res.redirect('/pemain/profile');
          _context5.next = 20;
          break;

        case 15:
          _context5.prev = 15;
          _context5.t0 = _context5["catch"](0);
          console.error(_context5.t0);
          req.flash('error_msg', 'Gagal menghapus ulasan.');
          res.redirect('/pemain/profile');

        case 20:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 15]]);
});
module.exports = router;
//# sourceMappingURL=ulasan.dev.js.map
