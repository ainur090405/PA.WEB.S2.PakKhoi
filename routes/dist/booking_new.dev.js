"use strict";

// routes/booking.js
var express = require('express');

var router = express.Router();

var Model_Reservasi = require('../models/Model_Reservasi');

var Model_Jadwal = require('../models/Model_Jadwal');

var Model_Pembayaran = require('../models/Model_Pembayaran');

var Model_Arena = require('../models/Model_Arena'); // Rute ini HANYA bisa diakses jika sudah login
// (karena akan kita kunci di app.js)


router.post('/create', function _callee(req, res) {
  var _req$body, id_jadwal, payment_method, amount, id_user, jadwalData, id_arena, arenaData, harga, dataReservasi, result, id_reservasi, dataPembayaran;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, id_jadwal = _req$body.id_jadwal, payment_method = _req$body.payment_method, amount = _req$body.amount;
          id_user = req.session.user.id; // Ambil ID dari session
          // 1. Ambil info jadwal untuk dapat id_arena

          _context.next = 5;
          return regeneratorRuntime.awrap(Model_Jadwal.getById(id_jadwal));

        case 5:
          jadwalData = _context.sent;

          if (!(jadwalData.length === 0)) {
            _context.next = 8;
            break;
          }

          throw new Error('Jadwal tidak ditemukan atau sudah dipesan.');

        case 8:
          if (!(jadwalData[0].status_slot !== 'kosong')) {
            _context.next = 11;
            break;
          }

          req.flash('error_msg', 'Maaf, slot ini baru saja dipesan orang lain.');
          return _context.abrupt("return", res.redirect('back'));

        case 11:
          id_arena = jadwalData[0].id_arena; // 3. Ambil harga arena

          _context.next = 14;
          return regeneratorRuntime.awrap(Model_Arena.getById(id_arena));

        case 14:
          arenaData = _context.sent;
          harga = arenaData[0].harga || 0; // 4. Buat data reservasi baru dengan payment info

          dataReservasi = {
            id_user: id_user,
            id_arena: id_arena,
            id_jadwal: id_jadwal,
            status: 'menunggu',
            // Status awal
            payment_method: payment_method,
            payment_status: payment_method === 'cod' ? 'pending' : 'unpaid',
            // COD pending, Midtrans unpaid
            amount: payment_method === 'midtrans' ? parseFloat(amount) : harga // Use provided amount for midtrans, arena price for COD

          }; // Pastikan Model_Reservasi punya fungsi Store

          _context.next = 19;
          return regeneratorRuntime.awrap(Model_Reservasi.Store(dataReservasi));

        case 19:
          result = _context.sent;
          id_reservasi = result.insertId; // 5. Buat record pembayaran

          dataPembayaran = {
            id_reservasi: id_reservasi,
            metode_pembayaran: payment_method,
            status_pembayaran: payment_method === 'cod' ? 'pending' : 'unpaid',
            jumlah: dataReservasi.amount
          };
          _context.next = 24;
          return regeneratorRuntime.awrap(Model_Pembayaran.Store(dataPembayaran));

        case 24:
          _context.next = 26;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'terisi'
          }));

        case 26:
          // 7. Berhasil! Arahkan ke halaman profil
          req.flash('success_msg', 'Booking berhasil! Menunggu konfirmasi Admin.');
          res.redirect('/pemain/profile'); // Arahkan ke riwayat pemesanan

          _context.next = 35;
          break;

        case 30:
          _context.prev = 30;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          req.flash('error_msg', 'Maaf, terjadi kesalahan saat melakukan booking.');
          res.redirect('back'); // Kembali ke halaman detail arena

        case 35:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 30]]);
});
module.exports = router;
//# sourceMappingURL=booking_new.dev.js.map
