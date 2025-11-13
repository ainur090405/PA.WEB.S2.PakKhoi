// routes/booking.js
const express = require('express');
const router = express.Router();
const Model_Reservasi = require('../models/Model_Reservasi');
const Model_Jadwal = require('../models/Model_Jadwal');
const Model_Pembayaran = require('../models/Model_Pembayaran');
const Model_Arena = require('../models/Model_Arena');

// Rute ini HANYA bisa diakses jika sudah login
// (karena akan kita kunci di app.js)

router.post('/create', async (req, res) => {
  const connection = require('../config/database'); // Import connection for transaction

  try {
    const { id_jadwal, payment_method, amount } = req.body;
    const id_user = req.session.user ? req.session.user.id : null;

    // Validasi input
    if (!id_user) {
      req.flash('error_msg', 'Anda harus login untuk melakukan booking.');
      return res.redirect('/auth/login');
    }

    if (!id_jadwal || !payment_method) {
      req.flash('error_msg', 'Data booking tidak lengkap.');
      return res.redirect('back');
    }

    if (!['cod', 'midtrans'].includes(payment_method)) {
      req.flash('error_msg', 'Metode pembayaran tidak valid.');
      return res.redirect('back');
    }

    // Start transaction
    await new Promise((resolve, reject) => {
      connection.beginTransaction(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // 1. Ambil info jadwal untuk dapat id_arena (lock for update)
      const jadwalData = await new Promise((resolve, reject) => {
        connection.query('SELECT * FROM jadwal WHERE id_jadwal = ? FOR UPDATE', [id_jadwal], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (jadwalData.length === 0) {
        throw new Error('Jadwal tidak ditemukan.');
      }

      // 2. Pastikan slot masih kosong (double check dengan lock)
      if (jadwalData[0].status_slot !== 'kosong') {
        throw new Error('Maaf, slot ini sudah dipesan atau sedang menunggu konfirmasi.');
      }

      const id_arena = jadwalData[0].id_arena;

      // 3. Ambil harga arena
      const arenaData = await Model_Arena.getById(id_arena);
      if (arenaData.length === 0) {
        throw new Error('Arena tidak ditemukan.');
      }
      const harga = arenaData[0].harga || 0;

      // 4. Validasi amount untuk midtrans
      let finalAmount = harga;
      if (payment_method === 'midtrans') {
        if (!amount || isNaN(parseFloat(amount))) {
          throw new Error('Jumlah pembayaran tidak valid.');
        }
        finalAmount = parseFloat(amount);
      }

      // 5. Buat data reservasi baru dengan payment info
      const dataReservasi = {
        id_user: id_user,
        id_arena: id_arena,
        id_jadwal: id_jadwal,
        status: 'menunggu',
        payment_method: payment_method,
        payment_status: payment_method === 'cod' ? 'pending' : 'unpaid',
        amount: finalAmount
      };

      const result = await Model_Reservasi.Store(dataReservasi);
      const id_reservasi = result.insertId;

      // 6. Buat record pembayaran
      const dataPembayaran = {
        id_reservasi: id_reservasi,
        metode_pembayaran: payment_method,
        status_pembayaran: payment_method === 'cod' ? 'pending' : 'unpaid',
        jumlah: finalAmount,
        tanggal_pembayaran: new Date(),
        bukti_pembayaran: null, // Untuk COD tidak ada bukti pembayaran
        catatan_admin: null,
        konfirmasi_admin: false
      };
      await Model_Pembayaran.Store(dataPembayaran);

      // 7. UPDATE status slot jadwal menjadi 'menunggu'
      await Model_Jadwal.Update(id_jadwal, { status_slot: 'menunggu' });

      // Commit transaction
      await new Promise((resolve, reject) => {
        connection.commit(err => {
          if (err) reject(err);
          else resolve();
        });
      });

      // 8. Berhasil! Arahkan ke halaman profil
      const successMsg = payment_method === 'cod'
        ? 'Booking COD berhasil! Menunggu konfirmasi Admin.'
        : 'Booking berhasil! Silakan selesaikan pembayaran.';
      req.flash('success_msg', successMsg);
      res.redirect('/pemain/profile');

    } catch (innerErr) {
      // Rollback transaction
      await new Promise((resolve, reject) => {
        connection.rollback(err => {
          if (err) reject(err);
          else resolve();
        });
      });
      throw innerErr;
    }

  } catch (err) {
    console.error('Booking error:', err);
    const errorMsg = err.message || 'Maaf, terjadi kesalahan saat melakukan booking.';
    req.flash('error_msg', errorMsg);
    res.redirect('back');
  }
});

module.exports = router;
