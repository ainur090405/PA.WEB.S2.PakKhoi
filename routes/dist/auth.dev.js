"use strict";

var express = require('express');

var router = express.Router();

var bcrypt = require('bcryptjs');

var Model_Users = require('../models/Model_Users');

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
});
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
          user = users[0];
          _context2.next = 11;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password_hash));

        case 11:
          isMatch = _context2.sent;

          if (isMatch) {
            _context2.next = 15;
            break;
          }

          req.flash('error_msg', 'Email atau Password salah.');
          return _context2.abrupt("return", res.redirect('/auth/login'));

        case 15:
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

          _context2.next = 25;
          break;

        case 20:
          _context2.prev = 20;
          _context2.t0 = _context2["catch"](1);
          console.error(_context2.t0);
          req.flash('error_msg', 'Terjadi kesalahan server.');
          res.redirect('/auth/login');

        case 25:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 20]]);
});
router.get('/logout', function (req, res) {
  req.flash('success_msg', 'Anda berhasil logout.');
  req.session.destroy(function (err) {
    if (err) console.error(err);
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});
module.exports = router;
//# sourceMappingURL=auth.dev.js.map
