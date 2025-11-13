"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// routes/venues.js
var express = require('express');

var router = express.Router();

var Model_Arena = require('../models/Model_Arena');

var Model_Jadwal = require('../models/Model_Jadwal');

var Model_FotoArena = require('../models/Model_FotoArena'); // <-- 1. IMPORT MODEL FOTO
// GET: Halaman "Cari Arena" (Etalase)


router.get('/', function _callee(req, res) {
  var filter, _ref, _ref2, arenaData, jenisList;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          filter = {
            lokasi: req.query.lokasi || null,
            jenis: req.query.jenis || null
          };
          _context.next = 4;
          return regeneratorRuntime.awrap(Promise.all([Model_Arena.getPublic(filter), Model_Arena.getJenisOlahragaList()]));

        case 4:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 2);
          arenaData = _ref2[0];
          jenisList = _ref2[1];
          res.render('venues/index', {
            title: 'Cari Arena',
            data: arenaData,
            jenisList: jenisList,
            filter: filter
          });
          _context.next = 16;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          req.flash('error_msg', 'Gagal memuat halaman arena.');
          res.redirect('/');

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // ==========================================================
// GET: Halaman Detail 1 Arena (INI YANG DIPERBAIKI)
// ==========================================================

router.get('/detail/:id', function _callee2(req, res) {
  var id_arena, _ref3, _ref4, arenaData, jadwalData, fotoData;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          id_arena = req.params.id; // 2. KITA AMBIL 3 DATA SEKALIGUS

          _context2.next = 4;
          return regeneratorRuntime.awrap(Promise.all([Model_Arena.getById(id_arena), Model_Jadwal.getAvailableByArenaId(id_arena), Model_FotoArena.getByArenaId(id_arena) // <-- PANGGIL FUNGSI GALERI
          ]));

        case 4:
          _ref3 = _context2.sent;
          _ref4 = _slicedToArray(_ref3, 3);
          arenaData = _ref4[0];
          jadwalData = _ref4[1];
          fotoData // <-- 3. AMBIL DATA FOTO
          = _ref4[2];

          if (!(arenaData.length === 0)) {
            _context2.next = 12;
            break;
          }

          req.flash('error_msg', 'Arena tidak ditemukan.');
          return _context2.abrupt("return", res.redirect('/venues'));

        case 12:
          // 4. KIRIM SEMUA DATA KE VIEW
          res.render('venues/detail', {
            title: arenaData[0].nama_arena,
            arena: arenaData[0],
            jadwal: jadwalData,
            fotoList: fotoData // <-- 5. KIRIM FOTO LIST

          });
          _context2.next = 20;
          break;

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          req.flash('error_msg', 'Gagal memuat detail arena.');
          res.redirect('/venues');

        case 20:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 15]]);
});
module.exports = router;
//# sourceMappingURL=venues.dev.js.map
