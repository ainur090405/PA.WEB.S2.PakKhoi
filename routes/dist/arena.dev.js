"use strict";

var express = require('express');

var router = express.Router();

var Model_Arena = require('../models/Model_Arena');

var Model_FotoArena = require('../models/Model_FotoArena'); // Kita perlu ini untuk Hapus


var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isAdmin = _require.isAdmin;

var fs = require('fs'); // Kita perlu ini untuk Hapus


var path = require('path'); // Kita perlu ini untuk Hapus
// HAPUS: 'upload' (multer) sudah tidak dipakai di sini


router.use(isAuthenticated, isAdmin); // GET: Menampilkan daftar arena

router.get('/', function _callee(req, res) {
  var arena;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Model_Arena.getAll());

        case 3:
          arena = _context.sent;
          res.render('admin/arena/index', {
            title: 'Manajemen Arena',
            data: arena
          });
          _context.next = 11;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          req.flash('error_msg', 'Gagal memuat data arena.');
          res.redirect('/admin/dashboard');

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // GET: Form tambah arena

router.get('/create', function (req, res) {
  res.render('admin/arena/create', {
    title: 'Tambah Arena Baru'
  });
}); // POST: Simpan arena baru (Sudah Benar)

router.post('/store', function _callee2(req, res) {
  var _req$body, nama_arena, jenis_olahraga, lokasi, harga, jam_buka, jam_tutup, status, dataArena, result, newArenaId;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body = req.body, nama_arena = _req$body.nama_arena, jenis_olahraga = _req$body.jenis_olahraga, lokasi = _req$body.lokasi, harga = _req$body.harga, jam_buka = _req$body.jam_buka, jam_tutup = _req$body.jam_tutup, status = _req$body.status;
          dataArena = {
            nama_arena: nama_arena,
            jenis_olahraga: jenis_olahraga,
            lokasi: lokasi,
            harga: harga,
            jam_buka: jam_buka,
            jam_tutup: jam_tutup,
            status: status
          };
          _context2.next = 5;
          return regeneratorRuntime.awrap(Model_Arena.Store(dataArena));

        case 5:
          result = _context2.sent;
          newArenaId = result.insertId;
          req.flash('success_msg', 'Arena baru berhasil ditambahkan. Sekarang, silakan upload foto galeri.');
          res.redirect("/foto/manage/".concat(newArenaId));
          _context2.next = 15;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          req.flash('error_msg', 'Gagal menyimpan arena: ' + _context2.t0.code);
          res.redirect('/arena/create');

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // GET: Form edit arena (Sudah Benar)

router.get('/edit/:id', function _callee3(req, res) {
  var arena;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(Model_Arena.getById(req.params.id));

        case 3:
          arena = _context3.sent;

          if (!(arena.length === 0)) {
            _context3.next = 7;
            break;
          }

          req.flash('error_msg', 'Arena tidak ditemukan.');
          return _context3.abrupt("return", res.redirect('/arena'));

        case 7:
          res.render('admin/arena/edit', {
            title: 'Edit Arena',
            arena: arena[0]
          });
          _context3.next = 14;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          req.flash('error_msg', 'Gagal memuat data arena.');
          res.redirect('/arena');

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 10]]);
}); // ===================================
// POST: Update arena (INI PERBAIKANNYA)
// ===================================

router.post('/update/:id', function _callee4(req, res) {
  var id, _req$body2, nama_arena, jenis_olahraga, lokasi, harga, jam_buka, jam_tutup, status, dataUpdate;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          id = req.params.id;
          _context4.prev = 1;
          // 1. Ambil data teks dari form
          _req$body2 = req.body, nama_arena = _req$body2.nama_arena, jenis_olahraga = _req$body2.jenis_olahraga, lokasi = _req$body2.lokasi, harga = _req$body2.harga, jam_buka = _req$body2.jam_buka, jam_tutup = _req$body2.jam_tutup, status = _req$body2.status; // 2. Buat variabel dengan nama yang benar (misal: 'dataUpdate')

          dataUpdate = {
            nama_arena: nama_arena,
            jenis_olahraga: jenis_olahraga,
            lokasi: lokasi,
            harga: harga,
            jam_buka: jam_buka,
            jam_tutup: jam_tutup,
            status: status
          }; // 3. Kirim variabel 'dataUpdate' ke model

          _context4.next = 6;
          return regeneratorRuntime.awrap(Model_Arena.Update(id, dataUpdate));

        case 6:
          // <-- DIUBAH
          req.flash('success_msg', 'Data arena berhasil diperbarui.');
          res.redirect('/arena');
          _context4.next = 14;
          break;

        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](1);
          req.flash('error_msg', 'Gagal memperbarui arena: ' + _context4.t0.code);
          res.redirect('/arena/edit/' + id);

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); // ===================================
// AKHIR PERBAIKAN
// ===================================
// GET: Hapus arena (Sudah Benar)

router.get('/delete/:id', function _callee5(req, res) {
  var id, fotoList;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          id = req.params.id;
          _context5.prev = 1;
          _context5.next = 4;
          return regeneratorRuntime.awrap(Model_FotoArena.getByArenaId(id));

        case 4:
          fotoList = _context5.sent;

          if (fotoList.length > 0) {
            fotoList.forEach(function (foto) {
              if (foto.url_foto) {
                var filePath = path.join(__dirname, '../public', foto.url_foto);

                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }
              }
            });
          }

          _context5.next = 8;
          return regeneratorRuntime.awrap(Model_Arena.Delete(id));

        case 8:
          req.flash('success_msg', 'Data arena dan semua fotonya berhasil dihapus.');
          res.redirect('/arena');
          _context5.next = 16;
          break;

        case 12:
          _context5.prev = 12;
          _context5.t0 = _context5["catch"](1);
          req.flash('error_msg', 'Gagal menghapus arena: ' + _context5.t0.code);
          res.redirect('/arena');

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 12]]);
});
router.get('/api/:id', function _callee6(req, res) {
  var arena;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(Model_Arena.getById(req.params.id));

        case 3:
          arena = _context6.sent;

          if (!(arena.length > 0)) {
            _context6.next = 8;
            break;
          }

          return _context6.abrupt("return", res.json(arena[0]));

        case 8:
          return _context6.abrupt("return", res.status(404).json({
            message: 'Arena tidak ditemukan'
          }));

        case 9:
          _context6.next = 15;
          break;

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](0);
          console.error('Error API /arena/api/:id:', _context6.t0);
          return _context6.abrupt("return", res.status(500).json({
            message: 'Terjadi kesalahan server'
          }));

        case 15:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;
//# sourceMappingURL=arena.dev.js.map
