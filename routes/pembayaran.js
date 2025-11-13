const express = require('express');
const router = express.Router();
const Model_Pembayaran = require('../models/Model_Pembayaran');
const Model_Reservasi = require('../models/Model_Reservasi');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Lindungi semua rute, hanya Admin
router.use(isAuthenticated, isAdmin);

// GET: Tampilkan daftar pembayaran yang pending
router.get('/', async (req, res) => {
  try {
    const pembayaran = await Model_Pembayaran.getPendingPayments();
    res.render('admin/pembayaran/index', {
      title: 'Konfirmasi Pembayaran',
      data: pembayaran
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat data pembayaran.');
    res.redirect('/admin/dashboard');
  }
});

// POST: Konfirmasi pembayaran
router.post('/confirm/:id', async (req, res) => {
  try {
    const id_pembayaran = req.params.id;
    const { catatan_admin } = req.body;

    // Konfirmasi pembayaran
    await Model_Pembayaran.confirmPayment(id_pembayaran, 'confirmed', catatan_admin);

    // Update status reservasi menjadi 'disetujui' jika pembayaran dikonfirmasi
    const pembayaranData = await Model_Pembayaran.getById(id_pembayaran);
    if (pembayaranData.length > 0) {
      await Model_Reservasi.Update(pembayaranData[0].id_reservasi, { status: 'disetujui' });

      // Update status slot jadwal menjadi 'terisi'
      const reservasiData = await Model_Reservasi.getById(pembayaranData[0].id_reservasi);
      if (reservasiData.length > 0) {
        const Model_Jadwal = require('../models/Model_Jadwal');
        await Model_Jadwal.Update(reservasiData[0].id_jadwal, { status_slot: 'terisi' });
      }

      // Kirim notifikasi pembayaran dikonfirmasi
      if (pembayaranData[0] && pembayaranData[0].id_user && typeof pembayaranData[0].id_user === 'number' && pembayaranData[0].id_user > 0) {
        try {
          const Model_Notifikasi = require('../models/Model_Notifikasi');
          const notifData = {
            id_user: pembayaranData[0].id_user,
            judul: 'Pembayaran Dikonfirmasi',
            isi_pesan: `Pembayaran Anda untuk arena ${pembayaranData[0].nama_arena || 'Arena'} telah dikonfirmasi. Booking Anda sekarang aktif.`,
            jenis_notif: 'status',
            tipe: 'payment',
            dibaca: 0
          };
          await Model_Notifikasi.Store(notifData);
        } catch (notifErr) {
          console.error('Failed to send notification:', notifErr);
          // Continue with confirmation even if notification fails
        }
      }
    }

    req.flash('success_msg', 'Pembayaran berhasil dikonfirmasi.');
    res.redirect('/admin/pembayaran');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal mengkonfirmasi pembayaran.');
    res.redirect('/admin/pembayaran');
  }
});

// POST: Konfirmasi COD (tanpa redirect, hanya flash message)
router.post('/confirm-cod/:id', async (req, res) => {
  try {
    const id_pembayaran = req.params.id;

    // Konfirmasi pembayaran COD
    await Model_Pembayaran.confirmPayment(id_pembayaran, 'confirmed', 'COD - Pembayaran diterima langsung');

    // Update status reservasi menjadi 'disetujui' jika pembayaran dikonfirmasi
    const pembayaranData = await Model_Pembayaran.getById(id_pembayaran);
    if (pembayaranData.length > 0) {
      await Model_Reservasi.Update(pembayaranData[0].id_reservasi, { status: 'disetujui' });

      // Update status slot jadwal menjadi 'terisi'
      const reservasiData = await Model_Reservasi.getById(pembayaranData[0].id_reservasi);
      if (reservasiData.length > 0) {
        const Model_Jadwal = require('../models/Model_Jadwal');
        await Model_Jadwal.Update(reservasiData[0].id_jadwal, { status_slot: 'terisi' });
      }

      // Kirim notifikasi pembayaran dikonfirmasi
      if (pembayaranData[0] && pembayaranData[0].id_user && typeof pembayaranData[0].id_user === 'number' && pembayaranData[0].id_user > 0) {
        try {
          const Model_Notifikasi = require('../models/Model_Notifikasi');
          const notifData = {
            id_user: pembayaranData[0].id_user,
            judul: 'Pembayaran COD Dikonfirmasi',
            isi_pesan: `Pembayaran COD Anda untuk arena ${pembayaranData[0].nama_arena || 'Arena'} telah dikonfirmasi. Booking Anda sekarang aktif.`,
            jenis_notif: 'status',
            tipe: 'payment',
            dibaca: 0
          };
          await Model_Notifikasi.Store(notifData);
        } catch (notifErr) {
          console.error('Failed to send notification:', notifErr);
        }
      }
    }

    // Return JSON response untuk AJAX
    res.json({ success: true, message: 'Pembayaran COD berhasil dikonfirmasi!' });
  } catch (err) {
    console.error(err);
    // Return JSON error response untuk AJAX, bukan redirect
    res.status(500).json({ success: false, message: 'Gagal mengkonfirmasi pembayaran COD. Silakan coba lagi.' });
  }
});

// POST: Tolak pembayaran
router.post('/reject/:id', async (req, res) => {
  try {
    const id_pembayaran = req.params.id;
    const { catatan_admin } = req.body;

    // Update status pembayaran menjadi 'rejected'
    await Model_Pembayaran.confirmPayment(id_pembayaran, 'rejected', catatan_admin);

    // Update status reservasi menjadi 'ditolak'
    const pembayaranData = await Model_Pembayaran.getById(id_pembayaran);
    if (pembayaranData.length > 0) {
      await Model_Reservasi.Update(pembayaranData[0].id_reservasi, { status: 'ditolak' });

      // Kirim notifikasi ke pemain jika id_user valid
      if (pembayaranData[0] && pembayaranData[0].id_user && typeof pembayaranData[0].id_user === 'number' && pembayaranData[0].id_user > 0) {
        try {
          const Model_Notifikasi = require('../models/Model_Notifikasi');
          const notifData = {
            id_user: pembayaranData[0].id_user,
            judul: 'Pembayaran Ditolak',
            isi_pesan: `Pembayaran Anda untuk arena ${pembayaranData[0].nama_arena || 'Arena'} ditolak. ${catatan_admin}`,
            jenis_notif: 'status',
            tipe: 'payment',
            dibaca: 0
          };
          await Model_Notifikasi.Store(notifData);
        } catch (notifErr) {
          console.error('Failed to send notification:', notifErr);
          // Continue with rejection even if notification fails
        }
      }
    }

    req.flash('error_msg', 'Pembayaran berhasil ditolak.');
    res.redirect('/admin/pembayaran');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal menolak pembayaran.');
    res.redirect('/admin/pembayaran');
  }
});

module.exports = router;
