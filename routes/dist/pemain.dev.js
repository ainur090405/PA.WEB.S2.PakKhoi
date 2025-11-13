"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var express = require('express');

var router = express.Router();

var Model_Users = require('../models/Model_Users');

var Model_Reservasi = require('../models/Model_Reservasi');

var Model_Ulasan = require('../models/Model_Ulasan');

var Model_Notifikasi = require('../models/Model_Notifikasi');

var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isPemain = _require.isPemain;

router.use(isAuthenticated, isPemain); // ========================
// Auto Update Status Reservasi
// ========================

var isBusy = false; // flag untuk mencegah bentrok update

function autoUpdateStatus() {
  return regeneratorRuntime.async(function autoUpdateStatus$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!isBusy) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return");

        case 2:
          // skip kalau sedang jalan
          isBusy = true;
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(Model_Reservasi.autoUpdateStatus());

        case 6:
          console.log("\u2705 Auto update status selesai - ".concat(new Date().toISOString()));
          _context.next = 12;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](3);
          console.error('❌ Gagal auto update status:', _context.t0);

        case 12:
          _context.prev = 12;
          isBusy = false;
          return _context.finish(12);

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 9, 12, 15]]);
} // Jalankan setiap 1 menit sekali


setInterval(autoUpdateStatus, 60 * 1000); // Middleware untuk mencegah request saat proses update berlangsung

router.use(function (req, res, next) {
  if (isBusy) {
    req.flash('error_msg', 'Server sedang sibuk, silakan coba lagi beberapa saat.');
    return res.redirect('back');
  }

  next();
}); // ========================
// Dashboard Pemain
// ========================

router.get('/dashboard', function _callee(req, res) {
  var userId, _ref, _ref2, reservasiData, notifications, stats;

  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          userId = req.session.user.id;
          _context2.next = 4;
          return regeneratorRuntime.awrap(Promise.all([Model_Reservasi.getByUser(userId), Model_Notifikasi.getByUser(userId)]));

        case 4:
          _ref = _context2.sent;
          _ref2 = _slicedToArray(_ref, 2);
          reservasiData = _ref2[0];
          notifications = _ref2[1];
          stats = {
            totalBookings: reservasiData.length,
            activeBookings: reservasiData.filter(function (r) {
              return r.status === 'disetujui' || r.status === 'menunggu';
            }).length,
            totalSpent: reservasiData.reduce(function (sum, r) {
              return sum + (r.amount || 0);
            }, 0)
          };
          res.render('pemain/dashboard', {
            title: 'Dashboard Pemain',
            stats: stats,
            recentBookings: reservasiData.slice(0, 5),
            notifications: notifications
          });
          _context2.next = 17;
          break;

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          req.flash('error_msg', 'Gagal memuat dashboard.');
          res.redirect('/');

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 12]]);
}); // ========================
// Halaman Profil
// ========================

router.get('/profile', function _callee2(req, res) {
  var userId, _ref3, _ref4, userData, ulasanData, reservasiData;

  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          userId = req.session.user.id;
          _context3.next = 4;
          return regeneratorRuntime.awrap(Promise.all([Model_Users.getById(userId), Model_Ulasan.getByUser(userId), Model_Reservasi.getByUser(userId)]));

        case 4:
          _ref3 = _context3.sent;
          _ref4 = _slicedToArray(_ref3, 3);
          userData = _ref4[0];
          ulasanData = _ref4[1];
          reservasiData = _ref4[2];

          if (!(userData.length === 0)) {
            _context3.next = 12;
            break;
          }

          req.flash('error_msg', 'User tidak ditemukan.');
          return _context3.abrupt("return", res.redirect('/pemain/dashboard'));

        case 12:
          res.render('pemain/profile', {
            title: 'Profil Saya',
            user: userData[0],
            ulasan: ulasanData,
            reservasi: reservasiData
          });
          _context3.next = 20;
          break;

        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          req.flash('error_msg', 'Gagal memuat halaman profil.');
          res.redirect('/pemain/dashboard');

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 15]]);
}); // ========================
// Tambah Ulasan
// ========================

router.post('/ulasan/create/:id', function _callee3(req, res) {
  var id_user, id_reservasi, _req$body, rating, komentar;

  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          id_user = req.session.user.id;
          id_reservasi = req.params.id;
          _req$body = req.body, rating = _req$body.rating, komentar = _req$body.komentar;
          _context4.next = 6;
          return regeneratorRuntime.awrap(Model_Ulasan.Store({
            id_user: id_user,
            id_reservasi: id_reservasi,
            rating: rating,
            komentar: komentar
          }));

        case 6:
          req.flash('success_msg', 'Ulasan berhasil disimpan!');
          res.redirect('/pemain/profile');
          _context4.next = 15;
          break;

        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](0);
          console.error(_context4.t0);
          req.flash('error_msg', 'Gagal menyimpan ulasan');
          res.redirect('/pemain/profile');

        case 15:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 10]]);
}); // ========================
// Update Ulasan
// ========================

router.post('/ulasan/update/:id', function _callee4(req, res) {
  var id_reservasi, _req$body2, rating, komentar;

  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          id_reservasi = req.params.id;
          _req$body2 = req.body, rating = _req$body2.rating, komentar = _req$body2.komentar;
          _context5.next = 5;
          return regeneratorRuntime.awrap(Model_Ulasan.UpdateByReservasi(id_reservasi, {
            rating: rating,
            komentar: komentar
          }));

        case 5:
          req.flash('success_msg', 'Ulasan berhasil diperbarui!');
          res.redirect('/pemain/profile');
          _context5.next = 14;
          break;

        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](0);
          console.error(_context5.t0);
          req.flash('error_msg', 'Gagal memperbarui ulasan');
          res.redirect('/pemain/profile');

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
module.exports = router;
//# sourceMappingURL=pemain.dev.js.map
