// routes/ulasan.js
const express = require('express');
const router = express.Router();
const Model_Ulasan = require('../models/Model_Ulasan');
const Model_Reservasi = require('../models/Model_Reservasi');
const { isAuthenticated, isPemain } = require('../middleware/authMiddleware');

// Middleware untuk pemain yang login
router.use(isAuthenticated, isPemain);

// GET: Form tambah ulasan
router.get('/create/:id_reservasi', async (req, res) => {
  try {
    const id_reservasi = req.params.id_reservasi;
    const userId = req.session.user.id;

    const reservasiData = await Model_Reservasi.getById(id_reservasi);
    if (reservasiData.length === 0) {
      req.flash('error_msg', 'Reservasi tidak ditemukan.');
      return res.redirect('/pemain/profile');
    }

    const reservasi = reservasiData[0];
    if (reservasi.id_user !== userId) {
      req.flash('error_msg', 'Anda tidak memiliki akses ke reservasi ini.');
      return res.redirect('/pemain/profile');
    }

    if (reservasi.status !== 'selesai') {
      req.flash('error_msg', 'Anda hanya bisa memberikan ulasan untuk reservasi yang sudah selesai.');
      return res.redirect('/pemain/profile');
    }

    // ✅ gunakan getByReservasi
    const existingReview = await Model_Ulasan.getByReservasi(id_reservasi);
    if (existingReview.length > 0) {
      req.flash('error_msg', 'Anda sudah memberikan ulasan untuk reservasi ini.');
      return res.redirect('/pemain/profile');
    }

    res.render('pemain/ulasan/create', {
      title: 'Beri Ulasan',
      reservasi
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat halaman ulasan.');
    res.redirect('/pemain/profile');
  }
});

// POST: Simpan ulasan
router.post('/create/:id_reservasi', async (req, res) => {
  try {
    const id_reservasi = req.params.id_reservasi;
    const userId = req.session.user.id;
    const { rating, komentar } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      req.flash('error_msg', 'Rating harus antara 1-5.');
      return res.redirect('back');
    }

    const existingReview = await Model_Ulasan.getByReservasi(id_reservasi);
    if (existingReview.length > 0) {
      req.flash('error_msg', 'Anda sudah memberikan ulasan untuk reservasi ini.');
      return res.redirect('/pemain/profile');
    }

    const dataUlasan = {
      id_user: userId,
      id_reservasi,
      rating: parseInt(rating),
      komentar: komentar || null
    };

    await Model_Ulasan.Store(dataUlasan);
    req.flash('success_msg', 'Terima kasih atas ulasan Anda!');
    res.redirect('/pemain/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal menyimpan ulasan.');
    res.redirect('back');
  }
});

// GET: Edit ulasan
router.get('/edit/:id_reservasi', async (req, res) => {
  try {
    const id_reservasi = req.params.id_reservasi;
    const userId = req.session.user.id;

    const ulasanData = await Model_Ulasan.getByReservasi(id_reservasi);
    if (ulasanData.length === 0) {
      req.flash('error_msg', 'Ulasan tidak ditemukan.');
      return res.redirect('/pemain/profile');
    }

    const ulasan = ulasanData[0];
    if (ulasan.id_user !== userId) {
      req.flash('error_msg', 'Anda tidak memiliki akses ke ulasan ini.');
      return res.redirect('/pemain/profile');
    }

    const reservasiData = await Model_Reservasi.getById(id_reservasi);
    const reservasi = reservasiData[0];

    res.render('pemain/ulasan/edit', {
      title: 'Edit Ulasan',
      ulasan,
      reservasi
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat halaman edit ulasan.');
    res.redirect('/pemain/profile');
  }
});

// POST: Update ulasan
router.post('/update/:id_reservasi', async (req, res) => {
  try {
    const id_reservasi = req.params.id_reservasi;
    const userId = req.session.user.id;
    const { rating, komentar } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      req.flash('error_msg', 'Rating harus antara 1-5.');
      return res.redirect('back');
    }

    const ulasanData = await Model_Ulasan.getByReservasi(id_reservasi);
    if (ulasanData.length === 0 || ulasanData[0].id_user !== userId) {
      req.flash('error_msg', 'Ulasan tidak ditemukan atau Anda tidak memiliki akses.');
      return res.redirect('/pemain/profile');
    }

    const dataUpdate = {
      rating: parseInt(rating),
      komentar: komentar || null
    };

    await Model_Ulasan.Update(id_reservasi, dataUpdate);
    req.flash('success_msg', 'Ulasan berhasil diperbarui!');
    res.redirect('/pemain/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memperbarui ulasan.');
    res.redirect('back');
  }
});

// POST: Hapus ulasan
router.post('/delete/:id_reservasi', async (req, res) => {
  try {
    const id_reservasi = req.params.id_reservasi;
    const userId = req.session.user.id;

    const ulasanData = await Model_Ulasan.getByReservasi(id_reservasi);
    if (ulasanData.length === 0 || ulasanData[0].id_user !== userId) {
      req.flash('error_msg', 'Ulasan tidak ditemukan atau Anda tidak memiliki akses.');
      return res.redirect('/pemain/profile');
    }

    await Model_Ulasan.Delete(id_reservasi);
    req.flash('success_msg', 'Ulasan berhasil dihapus.');
    res.redirect('/pemain/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal menghapus ulasan.');
    res.redirect('/pemain/profile');
  }
});

module.exports = router;
