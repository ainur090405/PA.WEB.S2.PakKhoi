// routes/booking.js
const express = require('express');
const router = express.Router();
const Model_Reservasi = require('../models/Model_Reservasi');
const Model_Jadwal = require('../models/Model_Jadwal');
const Model_Pembayaran = require('../models/Model_Pembayaran');
const Model_Arena = require('../models/Model_Arena');

router.post('/create', async (req, res) => {
  const connection = require('../config/database');

  try {
    const { id_jadwal, payment_method, amount } = req.body;
    const id_user = req.session.user ? req.session.user.id : null;

    if (!id_user) {
      req.flash('error_msg', 'Anda harus login untuk melakukan booking.');
      return res.redirect('/auth/login');
    }

    if (!id_jadwal || !payment_method) {
      req.flash('error_msg', 'Data booking tidak lengkap.');
      return res.redirect('back');
    }

    if (payment_method !== 'transaksi' && payment_method !== 'cod') {
      req.flash('error_msg', 'Metode pembayaran tidak valid.');
      return res.redirect('back');
    }

    // mulai transaksi
    await new Promise((resolve, reject) => {
      connection.beginTransaction(err => (err ? reject(err) : resolve()));
    });

    try {
      // 1. lock jadwal
      const jadwalData = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT * FROM jadwal WHERE id_jadwal = ? FOR UPDATE',
          [id_jadwal],
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });

      if (!jadwalData || jadwalData.length === 0) {
        throw new Error('Jadwal tidak ditemukan.');
      }

      if (jadwalData[0].status_slot !== 'kosong') {
        throw new Error('Maaf, slot ini sudah dipesan atau sedang menunggu konfirmasi.');
      }

      const id_arena = jadwalData[0].id_arena;

      // 2. ambil harga arena
      const arenaData = await Model_Arena.getById(id_arena);
      if (!arenaData || arenaData.length === 0) {
        throw new Error('Arena tidak ditemukan.');
      }
      const harga = arenaData[0].harga || 0;

      // 3. hitung amount
      let finalAmount = harga;
      if (payment_method === 'transaksi') {
        if (!amount || isNaN(parseFloat(amount))) {
          throw new Error('Jumlah pembayaran tidak valid.');
        }
        finalAmount = parseFloat(amount);
      }

      // 4. simpan reservasi (tanpa field pembayaran)
      const dataReservasi = {
        id_user,
        id_arena,
        id_jadwal,
        status: 'menunggu',   // menunggu konfirmasi / pembayaran
        catatan: null
      };
      const result = await Model_Reservasi.Store(dataReservasi);
      const id_reservasi = result.insertId;

      // 5. buat record pembayaran
      if (payment_method === 'cod') {
        // COD -> belum dibayar
        await Model_Pembayaran.createCODByReservasi(id_reservasi, finalAmount);
      } else {
        // Transfer (transaksi) -> status 'unpaid'
        await Model_Pembayaran.Store({
          id_reservasi,
          metode_pembayaran: 'transaksi',
          status_pembayaran: 'unpaid',
          jumlah: finalAmount,
          tanggal_pembayaran: new Date(),
          status_bukti: 'pending',
          konfirmasi_admin: false,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

// 7. UPDATE status slot jadwal menjadi 'menunggu'
        await Model_Jadwal.Update(id_jadwal, { status_slot: 'menunggu' });

        // Commit transaction
        await new Promise((resolve, reject) => {
          connection.commit(err => {
            if (err) reject(err);
            else resolve();
          });
        });

        // 8. Berhasil! Arahkan ke halaman DETAIL VENUE, bukan profil
        const successMsg = payment_method === 'cod'
          ? 'Booking COD berhasil! Menunggu konfirmasi Admin.'
          : 'Booking berhasil! Silakan selesaikan pembayaran.';

        req.flash('success_msg', successMsg);

// id_arena sudah kita ambil sebelumnya dari tabel jadwal
return res.redirect(`/venues/detail/${id_arena}`);

    } catch (innerErr) {
      await new Promise((resolve, reject) => {
        connection.rollback(err => (err ? reject(err) : resolve()));
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
