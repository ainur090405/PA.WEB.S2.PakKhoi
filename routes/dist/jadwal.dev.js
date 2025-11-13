"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var express = require('express');

var router = express.Router();

var Model_Jadwal = require('../models/Model_Jadwal');

var Model_Arena = require('../models/Model_Arena');

var Model_Reservasi = require('../models/Model_Reservasi'); // <-- Ini sudah benar, dibutuhkan


var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isAdmin = _require.isAdmin; // Lindungi semua rute, hanya Admin


router.use(isAuthenticated, isAdmin); // =============================================
// RUTE BARU: Menampilkan Halaman Generator
// (Ini adalah Langkah 3A)
// =============================================

router.get('/generator', function _callee(req, res) {
  var arenaList;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Model_Arena.getAll());

        case 3:
          arenaList = _context.sent;
          // Ambil daftar arena
          res.render('admin/jadwal/generator', {
            title: 'Generator Jadwal Massal',
            arenaList: arenaList // Kirim ke EJS untuk dropdown

          });
          _context.next = 11;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          req.flash('error_msg', 'Gagal memuat data arena.');
          res.redirect('/jadwal');

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // =============================================
// RUTE BARU: Memproses Logika "Pabrik"
// (Ini adalah Langkah 3B)
// =============================================

router.post('/generator', function _callee2(req, res) {
  var _req$body, id_arena, hari, jam_buka_operasi, jam_tutup_operasi, durasi_sesi, jumlah_minggu, daftarSesiBaru, hariInput, durasiMs, totalHari, namaHariJS, i, currentDate, namaHariIni, setTime, sesiMulai, jamTutupOperasi, sesiSelesai, dataSesi;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body = req.body, id_arena = _req$body.id_arena, hari = _req$body.hari, jam_buka_operasi = _req$body.jam_buka_operasi, jam_tutup_operasi = _req$body.jam_tutup_operasi, durasi_sesi = _req$body.durasi_sesi, jumlah_minggu = _req$body.jumlah_minggu;

          if (hari) {
            _context2.next = 5;
            break;
          }

          req.flash('error_msg', 'Anda harus memilih minimal satu hari.');
          return _context2.abrupt("return", res.redirect('/jadwal/generator'));

        case 5:
          daftarSesiBaru = [];
          hariInput = Array.isArray(hari) ? hari : [hari];
          durasiMs = parseInt(durasi_sesi) * 60000;
          totalHari = parseInt(jumlah_minggu) * 7;
          namaHariJS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          i = 0;

        case 11:
          if (!(i < totalHari)) {
            _context2.next = 31;
            break;
          }

          currentDate = new Date();
          currentDate.setDate(currentDate.getDate() + i);
          namaHariIni = namaHariJS[currentDate.getDay()];

          if (!hariInput.includes(namaHariIni)) {
            _context2.next = 28;
            break;
          }

          setTime = function setTime(date, timeStr) {
            var _timeStr$split = timeStr.split(':'),
                _timeStr$split2 = _slicedToArray(_timeStr$split, 2),
                hours = _timeStr$split2[0],
                minutes = _timeStr$split2[1];

            var newDate = new Date(date.getTime());
            newDate.setHours(hours, minutes, 0, 0);
            return newDate;
          };

          sesiMulai = setTime(currentDate, jam_buka_operasi);
          jamTutupOperasi = setTime(currentDate, jam_tutup_operasi);

        case 19:
          if (!(sesiMulai < jamTutupOperasi)) {
            _context2.next = 28;
            break;
          }

          sesiSelesai = new Date(sesiMulai.getTime() + durasiMs);

          if (!(sesiSelesai > jamTutupOperasi)) {
            _context2.next = 23;
            break;
          }

          return _context2.abrupt("break", 28);

        case 23:
          dataSesi = {
            id_arena: id_arena,
            tanggal: sesiMulai.toISOString().slice(0, 10),
            jam_mulai: sesiMulai.toTimeString().slice(0, 5),
            jam_selesai: sesiSelesai.toTimeString().slice(0, 5),
            status_slot: 'kosong'
          };
          daftarSesiBaru.push(dataSesi);
          sesiMulai = sesiSelesai;
          _context2.next = 19;
          break;

        case 28:
          i++;
          _context2.next = 11;
          break;

        case 31:
          if (!(daftarSesiBaru.length > 0)) {
            _context2.next = 37;
            break;
          }

          _context2.next = 34;
          return regeneratorRuntime.awrap(Model_Jadwal.StoreMany(daftarSesiBaru));

        case 34:
          // Memanggil fungsi dari Langkah 2
          req.flash('success_msg', "".concat(daftarSesiBaru.length, " slot jadwal baru berhasil di-generate!"));
          _context2.next = 38;
          break;

        case 37:
          req.flash('error_msg', 'Tidak ada jadwal yang di-generate. Cek kembali input Anda.');

        case 38:
          res.redirect('/jadwal');
          _context2.next = 46;
          break;

        case 41:
          _context2.prev = 41;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          req.flash('error_msg', 'Terjadi error saat generate jadwal: ' + _context2.t0.message);
          res.redirect('/jadwal/generator');

        case 46:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 41]]);
}); // =============================================
// RUTE-RUTE LAMA ANDA (CRUD MANUAL)
// (Ini adalah kode yang Anda kirim - TIDAK DIHAPUS)
// =============================================
// GET: Tampilkan daftar jadwal

router.get('/', function _callee3(req, res) {
  var jadwal;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(Model_Jadwal.getAll());

        case 3:
          jadwal = _context3.sent;
          res.render('admin/jadwal/index', {
            title: 'Manajemen Jadwal',
            data: jadwal
          });
          _context3.next = 11;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          req.flash('error_msg', 'Gagal memuat data jadwal.');
          res.redirect('/admin/dashboard');

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // GET: Form tambah jadwal

router.get('/create', function _callee4(req, res) {
  var arenaList;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(Model_Arena.getAll());

        case 3:
          arenaList = _context4.sent;
          // Ambil daftar arena
          res.render('admin/jadwal/create', {
            title: 'Tambah Jadwal Baru',
            arenaList: arenaList // Kirim ke EJS

          });
          _context4.next = 11;
          break;

        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](0);
          req.flash('error_msg', 'Gagal memuat data arena.');
          res.redirect('/jadwal');

        case 11:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // POST: Simpan jadwal baru

router.post('/store', function _callee5(req, res) {
  var _req$body2, id_arena, tanggal, jam_mulai, jam_selesai, status_slot, dataJadwal;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _req$body2 = req.body, id_arena = _req$body2.id_arena, tanggal = _req$body2.tanggal, jam_mulai = _req$body2.jam_mulai, jam_selesai = _req$body2.jam_selesai, status_slot = _req$body2.status_slot;
          dataJadwal = {
            id_arena: id_arena,
            tanggal: tanggal,
            jam_mulai: jam_mulai,
            jam_selesai: jam_selesai,
            status_slot: status_slot
          };
          _context5.next = 5;
          return regeneratorRuntime.awrap(Model_Jadwal.Store(dataJadwal));

        case 5:
          req.flash('success_msg', 'Jadwal baru berhasil ditambahkan.');
          res.redirect('/jadwal');
          _context5.next = 13;
          break;

        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](0);
          req.flash('error_msg', 'Gagal menyimpan jadwal: ' + _context5.t0.code);
          res.redirect('/jadwal/create');

        case 13:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // GET: Form edit jadwal

router.get('/edit/:id', function _callee6(req, res) {
  var id, _ref, _ref2, jadwalData, arenaList;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          id = req.params.id;
          _context6.next = 4;
          return regeneratorRuntime.awrap(Promise.all([Model_Jadwal.getById(id), Model_Arena.getAll()]));

        case 4:
          _ref = _context6.sent;
          _ref2 = _slicedToArray(_ref, 2);
          jadwalData = _ref2[0];
          arenaList = _ref2[1];

          if (!(jadwalData.length === 0)) {
            _context6.next = 11;
            break;
          }

          req.flash('error_msg', 'Jadwal tidak ditemukan.');
          return _context6.abrupt("return", res.redirect('/jadwal'));

        case 11:
          res.render('admin/jadwal/edit', {
            title: 'Edit Jadwal',
            jadwal: jadwalData[0],
            arenaList: arenaList
          });
          _context6.next = 18;
          break;

        case 14:
          _context6.prev = 14;
          _context6.t0 = _context6["catch"](0);
          req.flash('error_msg', 'Gagal memuat data.');
          res.redirect('/jadwal');

        case 18:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 14]]);
}); // POST: Update jadwal

router.post('/update/:id', function _callee7(req, res) {
  var id, _req$body3, id_arena, tanggal, jam_mulai, jam_selesai, status_slot, dataJadwal;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          id = req.params.id;
          _context7.prev = 1;
          _req$body3 = req.body, id_arena = _req$body3.id_arena, tanggal = _req$body3.tanggal, jam_mulai = _req$body3.jam_mulai, jam_selesai = _req$body3.jam_selesai, status_slot = _req$body3.status_slot;
          dataJadwal = {
            id_arena: id_arena,
            tanggal: tanggal,
            jam_mulai: jam_mulai,
            jam_selesai: jam_selesai,
            status_slot: status_slot
          };
          _context7.next = 6;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id, dataJadwal));

        case 6:
          req.flash('success_msg', 'Data jadwal berhasil diperbarui.');
          res.redirect('/jadwal');
          _context7.next = 14;
          break;

        case 10:
          _context7.prev = 10;
          _context7.t0 = _context7["catch"](1);
          req.flash('error_msg', 'Gagal memperbarui jadwal: ' + _context7.t0.code);
          res.redirect('/jadwal/edit/' + id);

        case 14:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[1, 10]]);
});
router.post('/update-status/:id', function _callee8(req, res) {
  var id_reservasi, status, reservasiData, reservasi, id_jadwal;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          id_reservasi = req.params.id;
          status = req.body.status;
          _context8.next = 5;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

        case 5:
          reservasiData = _context8.sent;
          reservasi = Array.isArray(reservasiData) ? reservasiData[0] : reservasiData;
          console.log('[DEBUG] Reservasi Ditemukan:', reservasi);

          if (!(!reservasi || !reservasi.id_jadwal)) {
            _context8.next = 12;
            break;
          }

          console.log('[DEBUG] Reservasi kosong atau tidak punya id_jadwal.');
          req.flash('error_msg', 'Data reservasi tidak ditemukan atau tidak valid.');
          return _context8.abrupt("return", res.redirect('/reservasi'));

        case 12:
          _context8.next = 14;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(id_reservasi, {
            status: status
          }));

        case 14:
          console.log("[DEBUG] Reservasi ".concat(id_reservasi, " \u2192 status ").concat(status)); // Sinkronisasi slot jadwal

          id_jadwal = reservasi.id_jadwal;

          if (!(status === 'disetujui')) {
            _context8.next = 22;
            break;
          }

          console.log("[DEBUG] Jadwal ".concat(id_jadwal, " \u2192 terisi"));
          _context8.next = 20;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'terisi'
          }));

        case 20:
          _context8.next = 26;
          break;

        case 22:
          if (!(status === 'ditolak' || status === 'batal')) {
            _context8.next = 26;
            break;
          }

          console.log("[DEBUG] Jadwal ".concat(id_jadwal, " \u2192 kosong"));
          _context8.next = 26;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'kosong'
          }));

        case 26:
          req.flash('success_msg', "Status reservasi berhasil diperbarui menjadi ".concat(status));
          res.redirect('/reservasi');
          _context8.next = 35;
          break;

        case 30:
          _context8.prev = 30;
          _context8.t0 = _context8["catch"](0);
          console.error('[DEBUG ERROR] Gagal update status:', _context8.t0);
          req.flash('error_msg', 'Gagal memperbarui status reservasi');
          res.redirect('/reservasi');

        case 35:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 30]]);
}); // GET: Hapus jadwal

router.get('/delete/:id', function _callee9(req, res) {
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return regeneratorRuntime.awrap(Model_Jadwal.Delete(req.params.id));

        case 3:
          req.flash('success_msg', 'Data jadwal berhasil dihapus.');
          res.redirect('/jadwal');
          _context9.next = 11;
          break;

        case 7:
          _context9.prev = 7;
          _context9.t0 = _context9["catch"](0);
          req.flash('error_msg', 'Gagal menghapus jadwal: ' + _context9.t0.code);
          res.redirect('/jadwal');

        case 11:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
module.exports = router;
//# sourceMappingURL=jadwal.dev.js.map
