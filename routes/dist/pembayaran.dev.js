"use strict";

// routes/pembayaran.js
var express = require('express');

var router = express.Router();

var connection = require('../config/database');

var Model_Pembayaran = require('../models/Model_Pembayaran');

var Model_Reservasi = require('../models/Model_Reservasi');

var Model_Jadwal = require('../models/Model_Jadwal');

var Model_Notifikasi = require('../models/Model_Notifikasi');

var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isAdmin = _require.isAdmin; // ⬇️ helper untuk log_reservasi


var _require2 = require('../helpers/logHelper'),
    createLog = _require2.createLog; // semua route di sini hanya boleh diakses admin


router.use(isAuthenticated, isAdmin); // ===============================
// GET: daftar pembayaran pending
// ===============================

router.get('/', function _callee(req, res) {
  var pembayaran;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Model_Pembayaran.getPendingPayments());

        case 3:
          pembayaran = _context.sent;
          res.render('admin/pembayaran/index', {
            title: 'Konfirmasi Pembayaran',
            data: pembayaran
          });
          _context.next = 12;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error('ERR GET /admin/pembayaran:', _context.t0);
          req.flash('error_msg', 'Gagal memuat data pembayaran.');
          res.redirect('/admin/dashboard');

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // =======================================
// POST: KONFIRMASI PEMBAYARAN (BERHASIL)
// =======================================

router.post('/confirm/:id_pembayaran', function (req, res) {
  var id_pembayaran = req.params.id_pembayaran;

  var _ref = req.body || {},
      catatan_admin = _ref.catatan_admin; // 1) ambil dulu pembayaran-nya


  connection.query('SELECT * FROM pembayaran WHERE id_pembayaran = ?', [id_pembayaran], function _callee3(err, rowsBayar) {
    var bayar, id_reservasi;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!err) {
              _context3.next = 4;
              break;
            }

            console.error('ERR SELECT pembayaran:', err);
            req.flash('error_msg', 'Gagal mengambil data pembayaran.');
            return _context3.abrupt("return", res.redirect('/admin/pembayaran'));

          case 4:
            if (!(!rowsBayar || rowsBayar.length === 0)) {
              _context3.next = 7;
              break;
            }

            req.flash('error_msg', 'Data pembayaran tidak ditemukan.');
            return _context3.abrupt("return", res.redirect('/admin/pembayaran'));

          case 7:
            bayar = rowsBayar[0];
            id_reservasi = bayar.id_reservasi; // 2) update tabel pembayaran -> confirmed

            connection.query("UPDATE pembayaran\n         SET status_pembayaran = 'confirmed',\n             konfirmasi_admin = 1,\n             catatan_admin = ?,\n             updated_at = NOW()\n         WHERE id_pembayaran = ?", [catatan_admin || null, id_pembayaran], function _callee2(err2) {
              var rowsReservasiBefore, reservasiBefore, statusAwal, rowsReservasi, reservasi, tanggalMain, jamMulai, jamSelesai, metodePembayaran, isiPesan;
              return regeneratorRuntime.async(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      if (!err2) {
                        _context2.next = 4;
                        break;
                      }

                      console.error('ERR UPDATE pembayaran:', err2);
                      req.flash('error_msg', 'Gagal mengkonfirmasi pembayaran.');
                      return _context2.abrupt("return", res.redirect('/admin/pembayaran'));

                    case 4:
                      _context2.prev = 4;
                      _context2.next = 7;
                      return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

                    case 7:
                      rowsReservasiBefore = _context2.sent;
                      reservasiBefore = rowsReservasiBefore && rowsReservasiBefore[0] ? rowsReservasiBefore[0] : null;
                      statusAwal = reservasiBefore ? reservasiBefore.status || null : null; // 3) update reservasi -> disetujui

                      _context2.next = 12;
                      return regeneratorRuntime.awrap(Model_Reservasi.Update(id_reservasi, {
                        status: 'disetujui'
                      }));

                    case 12:
                      _context2.next = 14;
                      return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

                    case 14:
                      rowsReservasi = _context2.sent;
                      reservasi = rowsReservasi && rowsReservasi[0] ? rowsReservasi[0] : null; // 3b) SIMPAN LOG RESERVASI

                      _context2.prev = 16;
                      _context2.next = 19;
                      return regeneratorRuntime.awrap(createLog(id_reservasi, statusAwal || 'menunggu', 'disetujui', 'Pembayaran dikonfirmasi admin'));

                    case 19:
                      _context2.next = 24;
                      break;

                    case 21:
                      _context2.prev = 21;
                      _context2.t0 = _context2["catch"](16);
                      console.warn('Gagal membuat log konfirmasi pembayaran:', _context2.t0);

                    case 24:
                      if (!(reservasi && reservasi.id_jadwal)) {
                        _context2.next = 27;
                        break;
                      }

                      _context2.next = 27;
                      return regeneratorRuntime.awrap(Model_Jadwal.Update(reservasi.id_jadwal, {
                        status_slot: 'terisi'
                      }));

                    case 27:
                      _context2.prev = 27;

                      if (!(reservasi && reservasi.id_user)) {
                        _context2.next = 36;
                        break;
                      }

                      // ====== DETAIL RESERVASI UNTUK NOTIF ======
                      tanggalMain = reservasi.tanggal ? new Date(reservasi.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : '-';
                      jamMulai = reservasi.jam_mulai ? reservasi.jam_mulai.substring(0, 5) : '-';
                      jamSelesai = reservasi.jam_selesai ? reservasi.jam_selesai.substring(0, 5) : '-';
                      metodePembayaran = bayar.metode_pembayaran || '–';
                      isiPesan = "Pembayaran Anda untuk arena ".concat(reservasi.nama_arena || 'Arena', " ") + "pada ".concat(tanggalMain, " pukul ").concat(jamMulai, "\u2013").concat(jamSelesai, " ") + "dengan metode ".concat(metodePembayaran, " telah dikonfirmasi. ") + "Booking Anda sekarang aktif.";
                      _context2.next = 36;
                      return regeneratorRuntime.awrap(Model_Notifikasi.Store({
                        id_user: reservasi.id_user,
                        judul: 'Pembayaran Dikonfirmasi',
                        isi_pesan: isiPesan,
                        jenis_notif: 'status',
                        tipe: 'payment',
                        dibaca: 0
                      }));

                    case 36:
                      _context2.next = 41;
                      break;

                    case 38:
                      _context2.prev = 38;
                      _context2.t1 = _context2["catch"](27);
                      console.warn('Gagal kirim notif konfirmasi pembayaran:', _context2.t1);

                    case 41:
                      req.flash('success_msg', 'Pembayaran berhasil dikonfirmasi.');
                      return _context2.abrupt("return", res.redirect('/admin/pembayaran'));

                    case 45:
                      _context2.prev = 45;
                      _context2.t2 = _context2["catch"](4);
                      console.error('ERR AFTER UPDATE pembayaran:', _context2.t2);
                      req.flash('error_msg', 'Pembayaran terupdate, tapi terjadi error lanjutan. Cek log server.');
                      return _context2.abrupt("return", res.redirect('/admin/pembayaran'));

                    case 50:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, null, null, [[4, 45], [16, 21], [27, 38]]);
            });

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    });
  });
}); // ==================================
// POST: TOLAK PEMBAYARAN (REJECTED)
// ==================================

router.post('/reject/:id_pembayaran', function (req, res) {
  var id_pembayaran = req.params.id_pembayaran;

  var _ref2 = req.body || {},
      catatan_admin = _ref2.catatan_admin; // 1) ambil dulu pembayaran


  connection.query('SELECT * FROM pembayaran WHERE id_pembayaran = ?', [id_pembayaran], function _callee5(err, rowsBayar) {
    var bayar, id_reservasi;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!err) {
              _context5.next = 4;
              break;
            }

            console.error('ERR SELECT pembayaran (reject):', err);
            req.flash('error_msg', 'Gagal mengambil data pembayaran.');
            return _context5.abrupt("return", res.redirect('/admin/pembayaran'));

          case 4:
            if (!(!rowsBayar || rowsBayar.length === 0)) {
              _context5.next = 7;
              break;
            }

            req.flash('error_msg', 'Data pembayaran tidak ditemukan.');
            return _context5.abrupt("return", res.redirect('/admin/pembayaran'));

          case 7:
            bayar = rowsBayar[0];
            id_reservasi = bayar.id_reservasi; // 2) update pembayaran -> rejected

            connection.query("UPDATE pembayaran\n         SET status_pembayaran = 'rejected',\n             konfirmasi_admin = 1,\n             catatan_admin = ?,\n             updated_at = NOW()\n         WHERE id_pembayaran = ?", [catatan_admin || null, id_pembayaran], function _callee4(err2) {
              var rowsReservasiBefore, reservasiBefore, statusAwal, rowsReservasi, _rowsReservasi, r, alasan, tanggalMain, jamMulai, jamSelesai, metodePembayaran, isiPesan;

              return regeneratorRuntime.async(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      if (!err2) {
                        _context4.next = 4;
                        break;
                      }

                      console.error('ERR UPDATE pembayaran (reject):', err2);
                      req.flash('error_msg', 'Gagal menolak pembayaran.');
                      return _context4.abrupt("return", res.redirect('/admin/pembayaran'));

                    case 4:
                      _context4.prev = 4;
                      _context4.next = 7;
                      return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

                    case 7:
                      rowsReservasiBefore = _context4.sent;
                      reservasiBefore = rowsReservasiBefore && rowsReservasiBefore[0] ? rowsReservasiBefore[0] : null;
                      statusAwal = reservasiBefore ? reservasiBefore.status || null : null; // 3) update reservasi -> ditolak + kosongkan slot

                      if (!(typeof Model_Reservasi.rejectAndFreeSlot === 'function')) {
                        _context4.next = 15;
                        break;
                      }

                      _context4.next = 13;
                      return regeneratorRuntime.awrap(Model_Reservasi.rejectAndFreeSlot(id_reservasi));

                    case 13:
                      _context4.next = 23;
                      break;

                    case 15:
                      _context4.next = 17;
                      return regeneratorRuntime.awrap(Model_Reservasi.Update(id_reservasi, {
                        status: 'ditolak'
                      }));

                    case 17:
                      _context4.next = 19;
                      return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

                    case 19:
                      rowsReservasi = _context4.sent;

                      if (!(rowsReservasi && rowsReservasi[0] && rowsReservasi[0].id_jadwal)) {
                        _context4.next = 23;
                        break;
                      }

                      _context4.next = 23;
                      return regeneratorRuntime.awrap(Model_Jadwal.Update(rowsReservasi[0].id_jadwal, {
                        status_slot: 'kosong'
                      }));

                    case 23:
                      _context4.prev = 23;
                      _context4.next = 26;
                      return regeneratorRuntime.awrap(createLog(id_reservasi, statusAwal || 'menunggu', 'ditolak', "Pembayaran ditolak admin. ".concat(catatan_admin || '')));

                    case 26:
                      _context4.next = 31;
                      break;

                    case 28:
                      _context4.prev = 28;
                      _context4.t0 = _context4["catch"](23);
                      console.warn('Gagal membuat log tolak pembayaran:', _context4.t0);

                    case 31:
                      _context4.prev = 31;
                      _context4.next = 34;
                      return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

                    case 34:
                      _rowsReservasi = _context4.sent;
                      r = _rowsReservasi && _rowsReservasi[0] ? _rowsReservasi[0] : null;

                      if (!(r && r.id_user)) {
                        _context4.next = 45;
                        break;
                      }

                      // alasan default kalau admin tidak isi catatan
                      alasan = catatan_admin && catatan_admin.trim() !== '' ? catatan_admin : 'Pembayaran ditolak karena data tidak lengkap atau batas waktu upload bukti pembayaran sudah habis.'; // DETAIL RESERVASI

                      tanggalMain = r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : '-';
                      jamMulai = r.jam_mulai ? r.jam_mulai.substring(0, 5) : '-';
                      jamSelesai = r.jam_selesai ? r.jam_selesai.substring(0, 5) : '-';
                      metodePembayaran = bayar.metode_pembayaran || '–';
                      isiPesan = "Pembayaran Anda untuk arena ".concat(r.nama_arena || 'Arena', " ") + "pada ".concat(tanggalMain, " pukul ").concat(jamMulai, "\u2013").concat(jamSelesai, " ") + "dengan metode ".concat(metodePembayaran, " ditolak. ") + "Alasan: ".concat(alasan);
                      _context4.next = 45;
                      return regeneratorRuntime.awrap(Model_Notifikasi.Store({
                        id_user: r.id_user,
                        judul: 'Pembayaran Ditolak',
                        isi_pesan: isiPesan,
                        jenis_notif: 'status',
                        tipe: 'payment',
                        dibaca: 0
                      }));

                    case 45:
                      _context4.next = 50;
                      break;

                    case 47:
                      _context4.prev = 47;
                      _context4.t1 = _context4["catch"](31);
                      console.warn('Gagal kirim notif tolak pembayaran:', _context4.t1);

                    case 50:
                      req.flash('success_msg', 'Pembayaran berhasil ditolak.');
                      return _context4.abrupt("return", res.redirect('/admin/pembayaran'));

                    case 54:
                      _context4.prev = 54;
                      _context4.t2 = _context4["catch"](4);
                      console.error('ERR AFTER UPDATE pembayaran (reject):', _context4.t2);
                      req.flash('error_msg', 'Pembayaran terupdate, tapi terjadi error lanjutan. Cek log server.');
                      return _context4.abrupt("return", res.redirect('/admin/pembayaran'));

                    case 59:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, null, null, [[4, 54], [23, 28], [31, 47]]);
            });

          case 10:
          case "end":
            return _context5.stop();
        }
      }
    });
  });
});
module.exports = router;
//# sourceMappingURL=pembayaran.dev.js.map
