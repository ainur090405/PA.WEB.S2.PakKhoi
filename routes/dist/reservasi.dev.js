"use strict";

// routes/reservasi.js
var express = require('express');

var router = express.Router();

var Model_Reservasi = require('../models/Model_Reservasi');

var Model_Jadwal = require('../models/Model_Jadwal');

var Model_Notifikasi = require('../models/Model_Notifikasi');

var Model_LogReservasi = require('../models/Model_LogReservasi');

var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated,
    isAdmin = _require.isAdmin; // Semua route di sini khusus admin


router.use(isAuthenticated, isAdmin); // ============================
// LIST RESERVASI (ADMIN)
// ============================

router.get('/', function _callee(req, res) {
  var reservasi;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Model_Reservasi.getAll());

        case 3:
          reservasi = _context.sent;
          res.render('admin/reservasi/index', {
            title: 'Manajemen Reservasi',
            data: reservasi
          });
          _context.next = 12;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error('ERR GET /admin/reservasi:', _context.t0);
          req.flash('error_msg', 'Gagal memuat data reservasi.');
          return _context.abrupt("return", res.redirect('/admin/dashboard'));

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // GET: form edit reservasi

router.get('/edit/:id', function _callee2(req, res) {
  var id, rows, reservasi, logs;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          id = parseInt(req.params.id, 10);
          _context2.next = 4;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id));

        case 4:
          rows = _context2.sent;

          if (!(!rows || rows.length === 0)) {
            _context2.next = 8;
            break;
          }

          req.flash('error_msg', 'Data reservasi tidak ditemukan.');
          return _context2.abrupt("return", res.redirect('/admin/reservasi'));

        case 8:
          reservasi = rows[0]; // ⬇️ AMBIL RIWAYAT LOG UNTUK RESERVASI INI

          logs = [];
          _context2.prev = 10;
          _context2.next = 13;
          return regeneratorRuntime.awrap(Model_LogReservasi.getByReservasi(id));

        case 13:
          logs = _context2.sent;
          _context2.next = 19;
          break;

        case 16:
          _context2.prev = 16;
          _context2.t0 = _context2["catch"](10);
          console.warn('Gagal mengambil log reservasi:', _context2.t0);

        case 19:
          res.render('admin/reservasi/edit', {
            title: 'Update Status Reservasi',
            reservasi: reservasi,
            logs: logs // dikirim ke view (kalau mau dipakai)

          });
          _context2.next = 27;
          break;

        case 22:
          _context2.prev = 22;
          _context2.t1 = _context2["catch"](0);
          console.error('ERR GET /admin/reservasi/edit:', _context2.t1);
          req.flash('error_msg', 'Gagal memuat data reservasi.');
          res.redirect('/admin/reservasi');

        case 27:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 22], [10, 16]]);
}); // ============================
// UPDATE STATUS (SINGLE FIELD)
// ============================

router.post('/update-status/:id', function _callee3(req, res) {
  var id_reservasi, status, rowsBefore, reservasiBefore, status_awal, r, rows, id_jadwal, _rows, _r, tanggalMain, jamMulai, jamSelesai, metodeText, isi_pesan, notif;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          id_reservasi = req.params.id;
          status = req.body.status; // ⬇️ AMBIL STATUS AWAL UNTUK LOG

          _context3.next = 5;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

        case 5:
          rowsBefore = _context3.sent;

          if (!(!rowsBefore || rowsBefore.length === 0)) {
            _context3.next = 9;
            break;
          }

          req.flash('error_msg', 'Reservasi tidak ditemukan.');
          return _context3.abrupt("return", res.redirect('/admin/reservasi'));

        case 9:
          reservasiBefore = rowsBefore[0];
          status_awal = reservasiBefore.status; // =======================
          // LOGIKA LAMA (TIDAK DIUBAH)
          // =======================

          if (!(status === 'ditolak')) {
            _context3.next = 27;
            break;
          }

          if (!(typeof Model_Reservasi.rejectAndFreeSlot === 'function')) {
            _context3.next = 17;
            break;
          }

          _context3.next = 15;
          return regeneratorRuntime.awrap(Model_Reservasi.rejectAndFreeSlot(id_reservasi));

        case 15:
          _context3.next = 25;
          break;

        case 17:
          _context3.next = 19;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(id_reservasi, {
            status: 'ditolak'
          }));

        case 19:
          _context3.next = 21;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

        case 21:
          r = _context3.sent;

          if (!(r && r[0] && r[0].id_jadwal)) {
            _context3.next = 25;
            break;
          }

          _context3.next = 25;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(r[0].id_jadwal, {
            status_slot: 'kosong'
          }));

        case 25:
          _context3.next = 48;
          break;

        case 27:
          _context3.next = 29;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(id_reservasi, {
            status: status
          }));

        case 29:
          _context3.next = 31;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

        case 31:
          rows = _context3.sent;

          if (!(rows && rows[0])) {
            _context3.next = 48;
            break;
          }

          id_jadwal = rows[0].id_jadwal;

          if (!id_jadwal) {
            _context3.next = 48;
            break;
          }

          if (!(status === 'disetujui')) {
            _context3.next = 40;
            break;
          }

          _context3.next = 38;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'terisi'
          }));

        case 38:
          _context3.next = 48;
          break;

        case 40:
          if (!(status === 'batal' || status === 'ditolak')) {
            _context3.next = 45;
            break;
          }

          _context3.next = 43;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'kosong'
          }));

        case 43:
          _context3.next = 48;
          break;

        case 45:
          if (!(status === 'selesai')) {
            _context3.next = 48;
            break;
          }

          _context3.next = 48;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'terisi'
          }));

        case 48:
          _context3.prev = 48;
          _context3.next = 51;
          return regeneratorRuntime.awrap(Model_LogReservasi.catatStatus(id_reservasi, status_awal, status, 'Update via tombol cepat /update-status'));

        case 51:
          _context3.next = 56;
          break;

        case 53:
          _context3.prev = 53;
          _context3.t0 = _context3["catch"](48);
          console.warn('Gagal mencatat log reservasi (update-status):', _context3.t0);

        case 56:
          _context3.prev = 56;
          _context3.next = 59;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id_reservasi));

        case 59:
          _rows = _context3.sent;

          if (!(_rows && _rows[0] && _rows[0].id_user)) {
            _context3.next = 72;
            break;
          }

          _r = _rows[0];
          tanggalMain = _r.tanggal ? new Date(_r.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : '-';
          jamMulai = _r.jam_mulai ? _r.jam_mulai.substring(0, 5) : '-';
          jamSelesai = _r.jam_selesai ? _r.jam_selesai.substring(0, 5) : '-';
          metodeText = '';

          if (_r.pembayaran_metode === 'cod') {
            metodeText = ' dengan metode COD (bayar di tempat)';
          } else if (_r.pembayaran_metode === 'transaksi') {
            metodeText = ' dengan metode Transfer Bank';
          } else {
            metodeText = '';
          }

          if (status === 'disetujui') {
            isi_pesan = "Booking Anda untuk arena ".concat(_r.nama_arena, " pada ").concat(tanggalMain, " ") + "pukul ".concat(jamMulai, "\u2013").concat(jamSelesai).concat(metodeText, " telah disetujui.");
          } else if (status === 'ditolak') {
            isi_pesan = "Maaf, booking Anda untuk arena ".concat(_r.nama_arena, " pada ").concat(tanggalMain, " ") + "pukul ".concat(jamMulai, "\u2013").concat(jamSelesai).concat(metodeText, " ditolak. ") + "Silakan hubungi admin untuk informasi lebih lanjut.";
          } else if (status === 'selesai') {
            isi_pesan = "Terima kasih telah bermain di ".concat(_r.nama_arena, " pada ").concat(tanggalMain, " ") + "pukul ".concat(jamMulai, "\u2013").concat(jamSelesai, ".");
          } else {
            isi_pesan = "Status booking Anda untuk arena ".concat(_r.nama_arena, " pada ").concat(tanggalMain, " ") + "pukul ".concat(jamMulai, "\u2013").concat(jamSelesai).concat(metodeText, " telah berubah menjadi ").concat(status, ".");
          }

          notif = {
            id_user: _r.id_user,
            judul: "Status Booking: ".concat(status.toUpperCase()),
            isi_pesan: isi_pesan,
            jenis_notif: 'status',
            tipe: 'booking',
            dibaca: 0
          };

          if (!(typeof Model_Notifikasi.Store === 'function')) {
            _context3.next = 72;
            break;
          }

          _context3.next = 72;
          return regeneratorRuntime.awrap(Model_Notifikasi.Store(notif));

        case 72:
          _context3.next = 77;
          break;

        case 74:
          _context3.prev = 74;
          _context3.t1 = _context3["catch"](56);
          console.warn('Gagal kirim notifikasi (non blocking):', _context3.t1);

        case 77:
          req.flash('success_msg', "Status reservasi berhasil diperbarui menjadi ".concat(status, "."));
          return _context3.abrupt("return", res.redirect('/admin/reservasi'));

        case 81:
          _context3.prev = 81;
          _context3.t2 = _context3["catch"](0);
          console.error('ERR POST /admin/reservasi/update-status:', _context3.t2);
          req.flash('error_msg', 'Gagal memperbarui status reservasi.');
          return _context3.abrupt("return", res.redirect('/admin/reservasi'));

        case 86:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 81], [48, 53], [56, 74]]);
}); // ============================
// UPDATE FORM LENGKAP (STATUS + CATATAN)
// ============================

router.post('/update/:id', function _callee4(req, res) {
  var id, _req$body, status, catatan, dataToUpdate, rows, r, status_awal, id_jadwal, tanggalMain, jamMulai, jamSelesai, metodeText, isi_pesan, notif;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          id = req.params.id;
          _context4.prev = 1;
          _req$body = req.body, status = _req$body.status, catatan = _req$body.catatan;
          dataToUpdate = {
            status: status,
            catatan: catatan
          }; // ⬇️ AMBIL DATA & STATUS AWAL UNTUK LOG

          _context4.next = 6;
          return regeneratorRuntime.awrap(Model_Reservasi.getById(id));

        case 6:
          rows = _context4.sent;

          if (!(!rows || rows.length === 0)) {
            _context4.next = 10;
            break;
          }

          req.flash('error_msg', 'Reservasi tidak ditemukan.');
          return _context4.abrupt("return", res.redirect('/admin/reservasi'));

        case 10:
          r = rows[0];
          status_awal = r.status;
          id_jadwal = r.id_jadwal; // Update status & catatan (LOGIKA LAMA)

          _context4.next = 15;
          return regeneratorRuntime.awrap(Model_Reservasi.Update(id, dataToUpdate));

        case 15:
          if (!id_jadwal) {
            _context4.next = 29;
            break;
          }

          if (!(status === 'disetujui')) {
            _context4.next = 21;
            break;
          }

          _context4.next = 19;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'terisi'
          }));

        case 19:
          _context4.next = 29;
          break;

        case 21:
          if (!(status === 'ditolak' || status === 'batal')) {
            _context4.next = 26;
            break;
          }

          _context4.next = 24;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'kosong'
          }));

        case 24:
          _context4.next = 29;
          break;

        case 26:
          if (!(status === 'selesai')) {
            _context4.next = 29;
            break;
          }

          _context4.next = 29;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'terisi'
          }));

        case 29:
          _context4.prev = 29;
          _context4.next = 32;
          return regeneratorRuntime.awrap(Model_LogReservasi.catatStatus(id, status_awal, status, catatan || null));

        case 32:
          _context4.next = 37;
          break;

        case 34:
          _context4.prev = 34;
          _context4.t0 = _context4["catch"](29);
          console.warn('Gagal mencatat log reservasi (update form):', _context4.t0);

        case 37:
          if (!r.id_user) {
            _context4.next = 48;
            break;
          }

          tanggalMain = r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : '-';
          jamMulai = r.jam_mulai ? r.jam_mulai.substring(0, 5) : '-';
          jamSelesai = r.jam_selesai ? r.jam_selesai.substring(0, 5) : '-';
          metodeText = '';

          if (r.pembayaran_metode === 'cod') {
            metodeText = ' dengan metode COD (bayar di tempat)';
          } else if (r.pembayaran_metode === 'transaksi') {
            metodeText = ' dengan metode Transfer Bank';
          }

          if (status === 'disetujui') {
            isi_pesan = "Booking Anda untuk arena ".concat(r.nama_arena, " pada ").concat(tanggalMain, " ") + "pukul ".concat(jamMulai, "\u2013").concat(jamSelesai).concat(metodeText, " telah disetujui.");
          } else if (status === 'ditolak') {
            isi_pesan = "Maaf, booking Anda untuk arena ".concat(r.nama_arena, " pada ").concat(tanggalMain, " ") + "pukul ".concat(jamMulai, "\u2013").concat(jamSelesai).concat(metodeText, " ditolak.") + (catatan ? " Alasan: ".concat(catatan) : '');
          } else if (status === 'selesai') {
            isi_pesan = "Terima kasih telah bermain di ".concat(r.nama_arena, " pada ").concat(tanggalMain, " ") + "pukul ".concat(jamMulai, "\u2013").concat(jamSelesai, ".");
          } else {
            isi_pesan = "Status booking Anda untuk arena ".concat(r.nama_arena, " pada ").concat(tanggalMain, " ") + "pukul ".concat(jamMulai, "\u2013").concat(jamSelesai).concat(metodeText, " telah berubah menjadi ").concat(status, ".");
          }

          notif = {
            id_user: r.id_user,
            judul: "Status Booking: ".concat(status.toUpperCase()),
            isi_pesan: isi_pesan,
            jenis_notif: 'status',
            tipe: 'booking',
            dibaca: 0
          };

          if (!(typeof Model_Notifikasi.Store === 'function')) {
            _context4.next = 48;
            break;
          }

          _context4.next = 48;
          return regeneratorRuntime.awrap(Model_Notifikasi.Store(notif));

        case 48:
          req.flash('success_msg', 'Status reservasi berhasil diperbarui.');
          return _context4.abrupt("return", res.redirect('/admin/reservasi'));

        case 52:
          _context4.prev = 52;
          _context4.t1 = _context4["catch"](1);
          console.error('ERR POST /admin/reservasi/update:', _context4.t1);
          req.flash('error_msg', 'Gagal memperbarui reservasi: ' + _context4.t1.message);
          return _context4.abrupt("return", res.redirect('/admin/reservasi/edit/' + id));

        case 57:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 52], [29, 34]]);
}); // ============================
// DELETE RESERVASI
// ============================

router.get('/delete/:id', function _callee5(req, res) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(Model_Reservasi.Delete(req.params.id));

        case 3:
          req.flash('success_msg', 'Data reservasi berhasil dihapus.');
          return _context5.abrupt("return", res.redirect('/admin/reservasi'));

        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          console.error('ERR GET /admin/reservasi/delete:', _context5.t0);
          req.flash('error_msg', 'Gagal menghapus reservasi: ' + (_context5.t0.message || _context5.t0.code));
          return _context5.abrupt("return", res.redirect('/admin/reservasi'));

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // ============================
// DOWNLOAD CSV
// ============================

router.get('/download', function _callee6(req, res) {
  var reservasi, csv;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(Model_Reservasi.getAll());

        case 3:
          reservasi = _context6.sent;
          csv = 'ID,Pemesan,Arena,Tanggal Main,Jam,Tanggal Pesan,Status,Metode Pembayaran,Status Pembayaran,Jumlah,Bukti\n';
          reservasi.forEach(function (r) {
            var tanggalMain = r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '';
            var jam = r.jam_mulai ? r.jam_mulai.substring(0, 5) : '';
            var tanggalPesan = r.tanggal_pesan ? new Date(r.tanggal_pesan).toLocaleDateString('id-ID') : '';
            var metode = r.metode_pembayaran || ''; // dari join pembayaran

            var statusPemb = r.status_pembayaran || '';
            var jumlah = r.jumlah || 0; // alias di model

            var bukti = r.pembayaran_bukti || '';
            csv += "".concat(r.id_reservasi, ",\"").concat((r.nama_user || '').replace(/"/g, '""'), "\",\"").concat((r.nama_arena || '').replace(/"/g, '""'), "\",").concat(tanggalMain, ",").concat(jam, ",").concat(tanggalPesan, ",").concat(r.status || '', ",").concat(metode, ",").concat(statusPemb, ",").concat(jumlah, ",").concat(bukti, "\n");
          });
          res.header('Content-Type', 'text/csv');
          res.attachment('reservasi.csv');
          return _context6.abrupt("return", res.send(csv));

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](0);
          console.error('ERR GET /admin/reservasi/download:', _context6.t0);
          req.flash('error_msg', 'Gagal mendownload data reservasi.');
          return _context6.abrupt("return", res.redirect('/admin/reservasi'));

        case 16:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;
//# sourceMappingURL=reservasi.dev.js.map
