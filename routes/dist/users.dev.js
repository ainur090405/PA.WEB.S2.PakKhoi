"use strict";

var express = require('express');

var router = express.Router();

var bcrypt = require('bcryptjs');

var Model_Users = require('../models/Model_Users');

var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isAdmin = _require.isAdmin; // Lindungi semua rute di file ini


router.use(isAuthenticated, isAdmin); // GET: Menampilkan daftar users

router.get('/', function _callee(req, res) {
  var users;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Model_Users.getAll());

        case 3:
          users = _context.sent;
          res.render('admin/users/index', {
            title: 'Manajemen User',
            data: users
          });
          _context.next = 12;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          req.flash('error_msg', 'Gagal memuat data users.');
          res.redirect('/admin/dashboard');

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // GET: Form tambah user

router.get('/create', function (req, res) {
  res.render('admin/users/create', {
    title: 'Tambah User Baru'
  });
}); // POST: Simpan user baru

router.post('/store', function _callee2(req, res) {
  var _req$body, nama, email, password, no_hp, role, status, hash, dataUser;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, nama = _req$body.nama, email = _req$body.email, password = _req$body.password, no_hp = _req$body.no_hp, role = _req$body.role, status = _req$body.status;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

        case 4:
          hash = _context2.sent;
          dataUser = {
            nama: nama,
            email: email,
            no_hp: no_hp,
            role: role,
            password_hash: hash,
            tanggal_daftar: new Date(),
            // kalau form belum punya field status, default-kan aktif
            status: status || 'aktif'
          };
          _context2.next = 8;
          return regeneratorRuntime.awrap(Model_Users.Store(dataUser));

        case 8:
          req.flash('success_msg', 'User baru berhasil ditambahkan.');
          res.redirect('/users');
          _context2.next = 17;
          break;

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](1);
          console.error(_context2.t0);
          req.flash('error_msg', 'Gagal menyimpan user: ' + (_context2.t0.code || _context2.t0.message));
          res.redirect('/users/create');

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 12]]);
}); // GET: Form edit user

router.get('/edit/:id', function _callee3(req, res) {
  var id, users;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          id = req.params.id;
          _context3.next = 4;
          return regeneratorRuntime.awrap(Model_Users.getById(id));

        case 4:
          users = _context3.sent;

          if (!(!users || users.length === 0)) {
            _context3.next = 8;
            break;
          }

          req.flash('error_msg', 'User tidak ditemukan.');
          return _context3.abrupt("return", res.redirect('/users'));

        case 8:
          res.render('admin/users/edit', {
            title: 'Edit User',
            user: users[0]
          });
          _context3.next = 16;
          break;

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          req.flash('error_msg', 'Gagal memuat data user.');
          res.redirect('/users');

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // POST: Update user

router.post('/update/:id', function _callee4(req, res) {
  var id, _req$body2, nama, email, password, no_hp, role, status, dataToUpdate;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          id = req.params.id;
          _req$body2 = req.body, nama = _req$body2.nama, email = _req$body2.email, password = _req$body2.password, no_hp = _req$body2.no_hp, role = _req$body2.role, status = _req$body2.status;
          _context4.prev = 2;
          // data dasar
          dataToUpdate = {
            nama: nama,
            email: email,
            no_hp: no_hp,
            role: role,
            status: status || 'aktif' // <-- penting

          }; // kalau password diisi, update juga password_hash

          if (!(password && password.trim() !== '')) {
            _context4.next = 8;
            break;
          }

          _context4.next = 7;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

        case 7:
          dataToUpdate.password_hash = _context4.sent;

        case 8:
          _context4.next = 10;
          return regeneratorRuntime.awrap(Model_Users.Update(id, dataToUpdate));

        case 10:
          req.flash('success_msg', 'Data user berhasil diperbarui.');
          res.redirect('/users');
          _context4.next = 19;
          break;

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](2);
          console.error(_context4.t0);
          req.flash('error_msg', 'Gagal memperbarui user: ' + (_context4.t0.code || _context4.t0.message));
          res.redirect('/users/edit/' + id);

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[2, 14]]);
}); // GET: Hapus user

router.get('/delete/:id', function _callee5(req, res) {
  var id;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          id = req.params.id; // cegah user menghapus dirinya sendiri

          if (!(Number(id) === Number(req.session.user.id))) {
            _context5.next = 4;
            break;
          }

          req.flash('error_msg', 'Anda tidak bisa menghapus akun Anda sendiri.');
          return _context5.abrupt("return", res.redirect('/users'));

        case 4:
          _context5.prev = 4;
          _context5.next = 7;
          return regeneratorRuntime.awrap(Model_Users.Delete(id));

        case 7:
          req.flash('success_msg', 'Data user berhasil dihapus.');
          res.redirect('/users');
          _context5.next = 16;
          break;

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](4);
          console.error(_context5.t0);
          req.flash('error_msg', 'Gagal menghapus user: ' + (_context5.t0.code || _context5.t0.message));
          res.redirect('/users');

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[4, 11]]);
});
module.exports = router;
//# sourceMappingURL=users.dev.js.map
