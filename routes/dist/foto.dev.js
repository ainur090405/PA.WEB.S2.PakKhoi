"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var express = require('express');

var router = express.Router();

var Model_Arena = require('../models/Model_Arena');

var Model_FotoArena = require('../models/Model_FotoArena');

var _require = require('../middleware/uploadMiddleware'),
    uploadArena = _require.uploadArena;

var _require2 = require('../middleware/authMiddleware'),
    isAuthenticated = _require2.isAuthenticated,
    isAdmin = _require2.isAdmin;

var fs = require('fs'); // Untuk hapus file


var path = require('path'); // Untuk hapus file
// Lindungi semua rute di file ini, hanya Admin


router.use(isAuthenticated, isAdmin);
/**
 * =======================================================
 * GET: Halaman Manajemen Galeri (Tampilan Utama)
 * =======================================================
 * Menampilkan form upload dan semua foto yang sudah ada
 * untuk satu arena spesifik.
 */

router.get('/manage/:id_arena', function _callee(req, res) {
  var id_arena, _ref, _ref2, arenaData, fotoData;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          id_arena = req.params.id_arena; // Ambil data arena (untuk judul) dan data foto (untuk galeri)

          _context.next = 4;
          return regeneratorRuntime.awrap(Promise.all([Model_Arena.getById(id_arena), Model_FotoArena.getByArenaId(id_arena)]));

        case 4:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 2);
          arenaData = _ref2[0];
          fotoData = _ref2[1];

          if (!(arenaData.length === 0)) {
            _context.next = 11;
            break;
          }

          req.flash('error_msg', 'Arena tidak ditemukan.');
          return _context.abrupt("return", res.redirect('/arena'));

        case 11:
          res.render('admin/foto/manage', {
            title: "Galeri Foto: ".concat(arenaData[0].nama_arena),
            arena: arenaData[0],
            // Kirim data arena (untuk id_foto_cover)
            fotoList: fotoData // Kirim daftar foto

          });
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          req.flash('error_msg', 'Gagal memuat galeri: ' + _context.t0.message);
          res.redirect('/arena');

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
});
/**
 * =======================================================
 * POST: Upload Foto Baru (Multi-Upload)
 * =======================================================
 * Menerima upload (bisa banyak file) dan menyimpannya.
 */

router.post('/store/:id_arena', uploadArena.array('foto_galeri', 10), function _callee2(req, res) {
  var id_arena, deskripsi, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, dataFoto;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // 'foto_galeri' adalah 'name' dari input file, '10' adalah batas max file
          id_arena = req.params.id_arena;
          _context2.prev = 1;
          deskripsi = req.body.deskripsi; // Ambil 1 deskripsi dari form

          if (!(!req.files || req.files.length === 0)) {
            _context2.next = 6;
            break;
          }

          req.flash('error_msg', 'Anda tidak memilih file untuk di-upload.');
          return _context2.abrupt("return", res.redirect("/foto/manage/".concat(id_arena)));

        case 6:
          // Loop semua file yang di-upload
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context2.prev = 9;
          _iterator = req.files[Symbol.iterator]();

        case 11:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context2.next = 19;
            break;
          }

          file = _step.value;
          dataFoto = {
            id_arena: id_arena,
            url_foto: '/uploads/arena/' + file.filename,
            deskripsi: deskripsi // Terapkan deskripsi yang sama ke semua foto

          };
          _context2.next = 16;
          return regeneratorRuntime.awrap(Model_FotoArena.Store(dataFoto));

        case 16:
          _iteratorNormalCompletion = true;
          _context2.next = 11;
          break;

        case 19:
          _context2.next = 25;
          break;

        case 21:
          _context2.prev = 21;
          _context2.t0 = _context2["catch"](9);
          _didIteratorError = true;
          _iteratorError = _context2.t0;

        case 25:
          _context2.prev = 25;
          _context2.prev = 26;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 28:
          _context2.prev = 28;

          if (!_didIteratorError) {
            _context2.next = 31;
            break;
          }

          throw _iteratorError;

        case 31:
          return _context2.finish(28);

        case 32:
          return _context2.finish(25);

        case 33:
          req.flash('success_msg', "".concat(req.files.length, " foto berhasil di-upload."));
          res.redirect("/foto/manage/".concat(id_arena));
          _context2.next = 41;
          break;

        case 37:
          _context2.prev = 37;
          _context2.t1 = _context2["catch"](1);
          req.flash('error_msg', 'Gagal upload foto: ' + _context2.t1.message);
          res.redirect("/foto/manage/".concat(id_arena));

        case 41:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 37], [9, 21, 25, 33], [26,, 28, 32]]);
});
/**
 * =======================================================
 * GET: Hapus 1 Foto
 * =======================================================
 * Menghapus file fisik dari server DAN datanya dari DB.
 */

router.get('/delete/:id_arena/:id_foto', function _callee3(req, res) {
  var _req$params, id_arena, id_foto, fotoData, filePath;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$params = req.params, id_arena = _req$params.id_arena, id_foto = _req$params.id_foto;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(Model_FotoArena.getById(id_foto));

        case 4:
          fotoData = _context3.sent;

          if (fotoData.length > 0 && fotoData[0].url_foto) {
            // 2. Hapus file fisik
            filePath = path.join(__dirname, '../public', fotoData[0].url_foto);

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } // 3. Hapus data dari DB


          _context3.next = 8;
          return regeneratorRuntime.awrap(Model_FotoArena.Delete(id_foto));

        case 8:
          req.flash('success_msg', 'Foto berhasil dihapus.');
          res.redirect("/foto/manage/".concat(id_arena));
          _context3.next = 16;
          break;

        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](1);
          req.flash('error_msg', 'Gagal menghapus foto.');
          res.redirect("/foto/manage/".concat(id_arena));

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 12]]);
});
/**
 * =======================================================
 * GET: Set 1 Foto sebagai Cover
 * =======================================================
 * Meng-update tabel 'arena' dengan 'id_foto_cover' yang baru.
 */

router.get('/setcover/:id_arena/:id_foto', function _callee4(req, res) {
  var _req$params2, id_arena, id_foto;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$params2 = req.params, id_arena = _req$params2.id_arena, id_foto = _req$params2.id_foto;
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(Model_Arena.setCover(id_arena, id_foto));

        case 4:
          req.flash('success_msg', 'Foto cover berhasil diperbarui.');
          res.redirect("/foto/manage/".concat(id_arena));
          _context4.next = 12;
          break;

        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](1);
          req.flash('error_msg', 'Gagal set foto cover.');
          res.redirect("/foto/manage/".concat(id_arena));

        case 12:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 8]]);
});
module.exports = router;
//# sourceMappingURL=foto.dev.js.map
