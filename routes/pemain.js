const express = require('express');
const router = express.Router();
const Model_Users = require('../models/Model_Users');
const Model_Reservasi = require('../models/Model_Reservasi');
const Model_Ulasan = require('../models/Model_Ulasan');
const Model_Notifikasi = require('../models/Model_Notifikasi');
const { isAuthenticated, isPemain } = require('../middleware/authMiddleware');

router.use(isAuthenticated, isPemain);

// ========================
// Auto Update Status Reservasi
// ========================
let isBusy = false; // flag untuk mencegah bentrok update

async function autoUpdateStatus() {
  if (isBusy) return; // skip kalau sedang jalan
  isBusy = true;

  try {
    // ✅ Panggil fungsi di model
    await Model_Reservasi.autoUpdateStatus();
    console.log(`✅ Auto update status selesai - ${new Date().toISOString()}`);
  } catch (err) {
    console.error('❌ Gagal auto update status:', err);
  } finally {
    isBusy = false;
  }
}

// Jalankan setiap 1 menit sekali
setInterval(autoUpdateStatus, 60 * 1000);

// Middleware untuk mencegah request saat proses update berlangsung
router.use((req, res, next) => {
  if (isBusy) {
    req.flash('error_msg', 'Server sedang sibuk, silakan coba lagi beberapa saat.');
    return res.redirect('back');
  }
  next();
});

// ========================
// Dashboard Pemain
// ========================
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const [reservasiData, notifications] = await Promise.all([
      Model_Reservasi.getByUser(userId),
      Model_Notifikasi.getByUser(userId)
    ]);

    const stats = {
      totalBookings: reservasiData.length,
      activeBookings: reservasiData.filter(r => r.status === 'disetujui' || r.status === 'menunggu').length,
      totalSpent: reservasiData.reduce((sum, r) => sum + (r.amount || 0), 0)
    };

    res.render('pemain/dashboard', {
      title: 'Dashboard Pemain',
      stats,
      recentBookings: reservasiData.slice(0, 5),
      notifications
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat dashboard.');
    res.redirect('/');
  }
});

// ========================
// Halaman Profil
// ========================
router.get('/profile', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const [userData, ulasanData, reservasiData] = await Promise.all([
      Model_Users.getById(userId),
      Model_Ulasan.getByUser(userId),
      Model_Reservasi.getByUser(userId)
    ]);

    if (userData.length === 0) {
      req.flash('error_msg', 'User tidak ditemukan.');
      return res.redirect('/pemain/dashboard');
    }

    res.render('pemain/profile', {
      title: 'Profil Saya',
      user: userData[0],
      ulasan: ulasanData,
      reservasi: reservasiData
    });

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat halaman profil.');
    res.redirect('/pemain/dashboard');
  }
});

// ========================
// Tambah Ulasan
// ========================
router.post('/ulasan/create/:id', async (req, res) => {
  try {
    const id_user = req.session.user.id;
    const id_reservasi = req.params.id;
    const { rating, komentar } = req.body;

    await Model_Ulasan.Store({
      id_user,
      id_reservasi,
      rating,
      komentar
    });

    req.flash('success_msg', 'Ulasan berhasil disimpan!');
    res.redirect('/pemain/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal menyimpan ulasan');
    res.redirect('/pemain/profile');
  }
});

// ========================
// Update Ulasan
// ========================
router.post('/ulasan/update/:id', async (req, res) => {
  try {
    const id_reservasi = req.params.id;
    const { rating, komentar } = req.body;

    await Model_Ulasan.UpdateByReservasi(id_reservasi, { rating, komentar });

    req.flash('success_msg', 'Ulasan berhasil diperbarui!');
    res.redirect('/pemain/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memperbarui ulasan');
    res.redirect('/pemain/profile');
  }
});

module.exports = router;
