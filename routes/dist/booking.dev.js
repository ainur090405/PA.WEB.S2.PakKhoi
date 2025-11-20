"use strict";

// routes/booking.js
var express = require('express');

var router = express.Router();

var Model_Reservasi = require('../models/Model_Reservasi');

var Model_Jadwal = require('../models/Model_Jadwal');

var Model_Pembayaran = require('../models/Model_Pembayaran');

var Model_Arena = require('../models/Model_Arena');

router.post('/create', function _callee(req, res) {
  var connection, _req$body, id_jadwal, payment_method, amount, id_user, jadwalData, id_arena, arenaData, harga, finalAmount, dataReservasi, result, id_reservasi, successMsg, errorMsg;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          connection = require('../config/database');
          _context.prev = 1;
          _req$body = req.body, id_jadwal = _req$body.id_jadwal, payment_method = _req$body.payment_method, amount = _req$body.amount;
          id_user = req.session.user ? req.session.user.id : null;

          if (id_user) {
            _context.next = 7;
            break;
          }

          req.flash('error_msg', 'Anda harus login untuk melakukan booking.');
          return _context.abrupt("return", res.redirect('/auth/login'));

        case 7:
          if (!(!id_jadwal || !payment_method)) {
            _context.next = 10;
            break;
          }

          req.flash('error_msg', 'Data booking tidak lengkap.');
          return _context.abrupt("return", res.redirect('back'));

        case 10:
          if (!(payment_method !== 'transaksi' && payment_method !== 'cod')) {
            _context.next = 13;
            break;
          }

          req.flash('error_msg', 'Metode pembayaran tidak valid.');
          return _context.abrupt("return", res.redirect('back'));

        case 13:
          _context.next = 15;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.beginTransaction(function (err) {
              return err ? reject(err) : resolve();
            });
          }));

        case 15:
          _context.prev = 15;
          _context.next = 18;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.query('SELECT * FROM jadwal WHERE id_jadwal = ? FOR UPDATE', [id_jadwal], function (err, rows) {
              return err ? reject(err) : resolve(rows);
            });
          }));

        case 18:
          jadwalData = _context.sent;

          if (!(!jadwalData || jadwalData.length === 0)) {
            _context.next = 21;
            break;
          }

          throw new Error('Jadwal tidak ditemukan.');

        case 21:
          if (!(jadwalData[0].status_slot !== 'kosong')) {
            _context.next = 23;
            break;
          }

          throw new Error('Maaf, slot ini sudah dipesan atau sedang menunggu konfirmasi.');

        case 23:
          id_arena = jadwalData[0].id_arena; // 2. ambil harga arena

          _context.next = 26;
          return regeneratorRuntime.awrap(Model_Arena.getById(id_arena));

        case 26:
          arenaData = _context.sent;

          if (!(!arenaData || arenaData.length === 0)) {
            _context.next = 29;
            break;
          }

          throw new Error('Arena tidak ditemukan.');

        case 29:
          harga = arenaData[0].harga || 0; // 3. hitung amount

          finalAmount = harga;

          if (!(payment_method === 'transaksi')) {
            _context.next = 35;
            break;
          }

          if (!(!amount || isNaN(parseFloat(amount)))) {
            _context.next = 34;
            break;
          }

          throw new Error('Jumlah pembayaran tidak valid.');

        case 34:
          finalAmount = parseFloat(amount);

        case 35:
          // 4. simpan reservasi (tanpa field pembayaran)
          dataReservasi = {
            id_user: id_user,
            id_arena: id_arena,
            id_jadwal: id_jadwal,
            status: 'menunggu',
            // menunggu konfirmasi / pembayaran
            catatan: null
          };
          _context.next = 38;
          return regeneratorRuntime.awrap(Model_Reservasi.Store(dataReservasi));

        case 38:
          result = _context.sent;
          id_reservasi = result.insertId; // 5. buat record pembayaran

          if (!(payment_method === 'cod')) {
            _context.next = 45;
            break;
          }

          _context.next = 43;
          return regeneratorRuntime.awrap(Model_Pembayaran.createCODByReservasi(id_reservasi, finalAmount));

        case 43:
          _context.next = 47;
          break;

        case 45:
          _context.next = 47;
          return regeneratorRuntime.awrap(Model_Pembayaran.Store({
            id_reservasi: id_reservasi,
            metode_pembayaran: 'transaksi',
            status_pembayaran: 'unpaid',
            jumlah: finalAmount,
            tanggal_pembayaran: new Date(),
            status_bukti: 'pending',
            konfirmasi_admin: false,
            created_at: new Date(),
            updated_at: new Date()
          }));

        case 47:
          _context.next = 49;
          return regeneratorRuntime.awrap(Model_Jadwal.Update(id_jadwal, {
            status_slot: 'menunggu'
          }));

        case 49:
          _context.next = 51;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.commit(function (err) {
              if (err) reject(err);else resolve();
            });
          }));

        case 51:
          // 8. Berhasil! Arahkan ke halaman DETAIL VENUE, bukan profil
          successMsg = payment_method === 'cod' ? 'Booking COD berhasil! Menunggu konfirmasi Admin.' : 'Booking berhasil! Silakan selesaikan pembayaran.';
          req.flash('success_msg', successMsg); // id_arena sudah kita ambil sebelumnya dari tabel jadwal

          return _context.abrupt("return", res.redirect("/venues/detail/".concat(id_arena)));

        case 56:
          _context.prev = 56;
          _context.t0 = _context["catch"](15);
          _context.next = 60;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            connection.rollback(function (err) {
              return err ? reject(err) : resolve();
            });
          }));

        case 60:
          throw _context.t0;

        case 61:
          _context.next = 69;
          break;

        case 63:
          _context.prev = 63;
          _context.t1 = _context["catch"](1);
          console.error('Booking error:', _context.t1);
          errorMsg = _context.t1.message || 'Maaf, terjadi kesalahan saat melakukan booking.';
          req.flash('error_msg', errorMsg);
          res.redirect('back');

        case 69:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 63], [15, 56]]);
});
module.exports = router;
//# sourceMappingURL=booking.dev.js.map
