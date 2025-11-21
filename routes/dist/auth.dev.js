"use strict";

var express = require('express');

var router = express.Router();

var bcrypt = require('bcryptjs');

var Model_Users = require('../models/Model_Users'); // =====================
// REGISTER
// =====================


router.get('/register', function (req, res) {
  res.render('auth/register', {
    title: 'Daftar Akun'
  });
});
router.post('/register', function _callee(req, res) {
  var _req$body, nama, email, password, konfirmasi_password, no_hp, users, hash, dataUser;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, nama = _req$body.nama, email = _req$body.email, password = _req$body.password, konfirmasi_password = _req$body.konfirmasi_password, no_hp = _req$body.no_hp;

          if (!(!nama || !email || !password || !no_hp)) {
            _context.next = 4;
            break;
          }

          req.flash('error_msg', 'Semua field wajib diisi.');
          return _context.abrupt("return", res.redirect('/auth/register'));

        case 4:
          if (!(password !== konfirmasi_password)) {
            _context.next = 7;
            break;
          }

          req.flash('error_msg', 'Password dan konfirmasi password tidak cocok.');
          return _context.abrupt("return", res.redirect('/auth/register'));

        case 7:
          _context.prev = 7;
          _context.next = 10;
          return regeneratorRuntime.awrap(Model_Users.getByEmail(email));

        case 10:
          users = _context.sent;

          if (!(users.length > 0)) {
            _context.next = 14;
            break;
          }

          req.flash('error_msg', 'Email sudah terdaftar.');
          return _context.abrupt("return", res.redirect('/auth/register'));

        case 14:
          _context.next = 16;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

        case 16:
          hash = _context.sent;
          dataUser = {
            nama: nama,
            email: email,
            no_hp: no_hp,
            password_hash: hash,
            role: 'pemain',
            status: 'aktif',
            // ✅ default akun baru = aktif
            tanggal_daftar: new Date()
          };
          _context.next = 20;
          return regeneratorRuntime.awrap(Model_Users.Store(dataUser));

        case 20:
          req.flash('success_msg', 'Registrasi berhasil. Silakan login.');
          res.redirect('/auth/login');
          _context.next = 29;
          break;

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](7);
          console.error(_context.t0);
          req.flash('error_msg', 'Terjadi kesalahan server: ' + _context.t0.code);
          res.redirect('/auth/register');

        case 29:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[7, 24]]);
}); // =====================
// LOGIN
// =====================

router.get('/login', function (req, res) {
  res.render('auth/login', {
    title: 'Login'
  });
});
router.post('/login', function _callee2(req, res) {
  var _req$body2, email, password, users, user, isMatch;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(Model_Users.getByEmail(email));

        case 4:
          users = _context2.sent;

          if (!(users.length === 0)) {
            _context2.next = 8;
            break;
          }

          req.flash('error_msg', 'Email atau Password salah.');
          return _context2.abrupt("return", res.redirect('/auth/login'));

        case 8:
          user = users[0]; // ✅ BLOKIR USER NONAKTIF

          if (!(user.status === 'nonaktif')) {
            _context2.next = 12;
            break;
          }

          req.flash('error_msg', 'Akun Anda tidak aktif. Silakan hubungi admin.');
          return _context2.abrupt("return", res.redirect('/auth/login'));

        case 12:
          _context2.next = 14;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password_hash));

        case 14:
          isMatch = _context2.sent;

          if (isMatch) {
            _context2.next = 18;
            break;
          }

          req.flash('error_msg', 'Email atau Password salah.');
          return _context2.abrupt("return", res.redirect('/auth/login'));

        case 18:
          req.session.user = {
            id: user.id_user,
            nama: user.nama,
            email: user.email,
            role: user.role
          };
          req.flash('success_msg', 'Login berhasil! Selamat datang, ' + user.nama);

          if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
          } else {
            res.redirect('/');
          }

          _context2.next = 28;
          break;

        case 23:
          _context2.prev = 23;
          _context2.t0 = _context2["catch"](1);
          console.error(_context2.t0);
          req.flash('error_msg', 'Terjadi kesalahan server.');
          res.redirect('/auth/login');

        case 28:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 23]]);
}); // =====================
// LOGOUT
// =====================

router.get('/logout', function (req, res) {
  req.flash('success_msg', 'Anda berhasil logout.');
  req.session.destroy(function (err) {
    if (err) console.error(err);
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
}); // Lupa Password - Form Email

router.get('/lupa-password', function (req, res) {
  res.render('auth/lupa_password', {
    title: 'Lupa Password'
  });
});
router.post('/lupa-password', function _callee3(req, res) {
  var email, user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          email = req.body.email;
          _context3.next = 3;
          return regeneratorRuntime.awrap(Model_Users.getByEmail(email));

        case 3:
          user = _context3.sent;

          if (!(!user || user.length === 0)) {
            _context3.next = 7;
            break;
          }

          req.flash('error', 'Email tidak ditemukan.');
          return _context3.abrupt("return", res.redirect('/auth/lupa-password'));

        case 7:
          res.render('auth/reset_password_simple', {
            title: 'Reset Password',
            id_user: user[0].id_user,
            email: user[0].email
          });

        case 8:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.post('/reset-password-simple', function _callee4(req, res) {
  var _req$body3, id_user, password, password_confirm, bcrypt, hash;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body3 = req.body, id_user = _req$body3.id_user, password = _req$body3.password, password_confirm = _req$body3.password_confirm;

          if (!(password !== password_confirm)) {
            _context4.next = 4;
            break;
          }

          req.flash('error', 'Konfirmasi password tidak sama.');
          return _context4.abrupt("return", res.redirect('back'));

        case 4:
          if (!(password.length < 6)) {
            _context4.next = 7;
            break;
          }

          req.flash('error', 'Password minimal 6 karakter.');
          return _context4.abrupt("return", res.redirect('back'));

        case 7:
          bcrypt = require('bcryptjs');
          _context4.next = 10;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

        case 10:
          hash = _context4.sent;
          _context4.next = 13;
          return regeneratorRuntime.awrap(Model_Users.Update(id_user, {
            password_hash: hash
          }));

        case 13:
          req.flash('success', 'Password berhasil diubah. Silakan login kembali.');
          res.redirect('/auth/login');

        case 15:
        case "end":
          return _context4.stop();
      }
    }
  });
});
module.exports = router;
//# sourceMappingURL=auth.dev.js.map
