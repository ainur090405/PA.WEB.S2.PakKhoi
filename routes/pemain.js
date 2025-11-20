const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Model_Users = require('../models/Model_Users');
const Model_Reservasi = require('../models/Model_Reservasi');
const Model_Ulasan = require('../models/Model_Ulasan');
const Model_Notifikasi = require('../models/Model_Notifikasi');
const Model_Pembayaran = require('../models/Model_Pembayaran');

const { isAuthenticated, isPemain } = require('../middleware/authMiddleware');
const { uploadBuktiPembayaran } = require('../middleware/uploadMiddleware');

router.use(isAuthenticated, isPemain);

// AUTO UPDATE STATUS (tetap sama)
let isBusy = false;
async function autoUpdateStatus() {
  if (isBusy) return;
  isBusy = true;
  try {
    await Model_Reservasi.autoUpdateStatus();
    console.log(`AUTO UPDATE OK - ${new Date().toISOString()}`);
  } catch (err) {
    console.error('AUTO UPDATE ERROR:', err);
  } finally {
    isBusy = false;
  }
}
setInterval(autoUpdateStatus, 60 * 1000);

router.use((req, res, next) => {
  if (isBusy) {
    req.flash('error_msg', 'Server sedang update, coba sebentar lagi.');
    return res.redirect('back');
  }
  next();
});

// DASHBOARD
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
      totalSpent: reservasiData.reduce((sum, r) => sum + (r.pembayaran_jumlah || 0), 0)
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
// Profil
// ========================
router.get('/profile', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const [userData, ulasanData, reservasiData] = await Promise.all([
      Model_Users.getById(userId),
      Model_Ulasan.getByUser(userId),
      Model_Reservasi.getByUser(userId)
    ]);

    if (!userData || userData.length === 0) {
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
// CREATE ULASAN
// ========================
router.post('/ulasan/create/:id', async (req, res) => {
  try {
    await Model_Ulasan.Store({
      id_user: req.session.user.id,
      id_reservasi: req.params.id,
      rating: req.body.rating,
      komentar: req.body.komentar
    });

    req.flash('success_msg', 'Ulasan berhasil disimpan!');
    res.redirect('/pemain/riwayat-ulasan');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal menyimpan ulasan');
    res.redirect('/pemain/riwayat-ulasan');
  }
});

// ========================
// UPDATE ULASAN
// ========================
router.post('/ulasan/update/:id', async (req, res) => {
  try {
    await Model_Ulasan.UpdateByReservasi(req.params.id, {
      rating: req.body.rating,
      komentar: req.body.komentar
    });

    req.flash('success_msg', 'Ulasan berhasil diperbarui!');
    res.redirect('/pemain/riwayat-ulasan');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memperbarui ulasan');
    res.redirect('/pemain/riwayat-ulasan');
  }
});

// ========================
// Halaman Riwayat
// ========================
router.get('/riwayat-ulasan', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const [userData, ulasanData, reservasiData] = await Promise.all([
      Model_Users.getById(userId),
      Model_Ulasan.getByUser(userId),
      Model_Reservasi.getByUser(userId)
    ]);

    res.render('pemain/riwayat-ulasan', {
      title: 'Riwayat & Ulasan',
      user: userData[0] || null,
      ulasan: ulasanData || [],
      reservasi: reservasiData || []
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat halaman.');
    res.redirect('/pemain/dashboard');
  }
});

router.post('/upload-bukti/:id_reservasi', (req, res) => {
  const id_reservasi = parseInt(req.params.id_reservasi, 10);
  const userId = req.session.user.id;

  uploadBuktiPembayaran.single('bukti_pembayaran')(req, res, async function (err) {
    try {
      if (err) {
        console.error('MULTER ERROR:', err);
        const msg = err.code === 'LIMIT_FILE_SIZE'
          ? 'File terlalu besar (maks 5MB).'
          : (err.message || 'Gagal mengupload file.');
        req.flash('error_msg', msg);
        return res.redirect('/pemain/riwayat-ulasan');
      }

      // validasi reservasi & owner
      const reservasiRows = await Model_Reservasi.getById(id_reservasi);
      if (!reservasiRows || reservasiRows.length === 0 || reservasiRows[0].id_user !== userId) {
        if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
        req.flash('error_msg', 'Reservasi tidak valid atau tidak memiliki akses.');
        return res.redirect('/pemain/riwayat-ulasan');
      }

      if (!req.file) {
        req.flash('error_msg', 'Silakan pilih file bukti pembayaran.');
        return res.redirect('/pemain/riwayat-ulasan');
      }

      // CUKUP: langsung simpan ke tabel pembayaran
      await Model_Pembayaran.uploadBuktiByReservasi(id_reservasi, req.file.filename);

      req.flash('success_msg', 'Bukti berhasil diupload! Menunggu konfirmasi admin.');
      return res.redirect('/pemain/riwayat-ulasan');

    } catch (catchErr) {
      console.error('UPLOAD HANDLER ERROR:', catchErr);
      if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
      req.flash('error_msg', 'Terjadi kesalahan saat mengupload bukti.');
      return res.redirect('/pemain/riwayat-ulasan');
    }
  });
});

// ========================
// DETAIL PEMBAYARAN (AJAX/modal)
// ========================
router.get('/detail-pembayaran/:id_reservasi', async (req, res) => {
  try {
    const id_reservasi = parseInt(req.params.id_reservasi, 10);
    const userId = req.session.user.id;

    const rows = await Model_Reservasi.getById(id_reservasi);
    if (!rows || rows.length === 0 || rows[0].id_user !== userId) {
      return res.json({ success: false, message: 'Akses ditolak' });
    }

    const r = rows[0];

    const pembayaran = {
      metode_pembayaran: r.pembayaran_metode,
      jumlah: r.pembayaran_jumlah,
      status_pembayaran: r.pembayaran_status,
      status_bukti: r.pembayaran_status_bukti,
      tanggal_pembayaran: r.pembayaran_tanggal,
      bukti_pembayaran: r.pembayaran_bukti,
      catatan_admin: r.pembayaran_catatan
    };

    return res.json({ success: true, pembayaran, reservasi: r });
  } catch (err) {
    console.error('Detail pembayaran error:', err);
    return res.json({ success: false, message: 'Error server' });
  }
});

// ========================
// DOWNLOAD PDF PEMBAYARAN
// ========================
router.get('/download-pdf/:id_reservasi', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const id = parseInt(req.params.id_reservasi, 10);

    const rows = await Model_Reservasi.getById(id);
    if (!rows || rows.length === 0 || rows[0].id_user !== userId) {
      req.flash('error_msg', 'Akses ditolak.');
      return res.redirect('/pemain/riwayat-ulasan');
    }

    const r = rows[0];

    const buktiFilename = r.pembayaran_bukti || null;
    const buktiPath = buktiFilename
      ? path.join(__dirname, '..', 'public', 'uploads', 'bukti_pembayaran', buktiFilename)
      : null;

    const doc = new PDFDocument({ margin: 40, autoFirstPage: true });
    const filename = `detail_pembayaran_${id}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Detail Pembayaran', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, { align: 'right' });
    doc.moveDown(1);

    // Informasi reservasi
    doc.fontSize(12).text('Informasi Reservasi', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11)
      .text(`ID Reservasi: ${r.id_reservasi}`)
      .text(`Pemesan     : ${r.nama_user || '-'}`)
      .text(`Arena       : ${r.nama_arena || '-'}`)
      .text(`Tanggal     : ${r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-'}`)
      .text(`Jam         : ${r.jam_mulai ? r.jam_mulai.substring(0,5) : '-'} - ${r.jam_selesai ? r.jam_selesai.substring(0,5) : '-'}`)
      .text(`Status      : ${r.status || '-'}`)
      .moveDown(0.8);

    // Informasi pembayaran
    doc.fontSize(12).text('Detail Pembayaran', { underline: true });
    doc.moveDown(0.3);
    const metode = r.pembayaran_metode || 'transaksi';
    const jumlah = r.pembayaran_jumlah || 0;
    const statusPemb = r.pembayaran_status || '-';
    doc.fontSize(11)
      .text(`Metode Pembayaran : ${metode}`)
      .text(`Jumlah            : Rp ${Number(jumlah).toLocaleString('id-ID')}`)
      .text(`Status Pembayaran : ${statusPemb}`)
      .text(`Tanggal Pembayaran: ${r.pembayaran_tanggal ? new Date(r.pembayaran_tanggal).toLocaleString('id-ID') : '-'}`)
      .moveDown(0.8);

    // Rekening tujuan — opsional, kalau nanti kamu isi di tabel pembayaran
    doc.fontSize(12).text('Rekening Tujuan', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11)
      .text(`Bank        : -`)
      .text(`No. Rekening: -`)
      .text(`Atas Nama   : -`)
      .moveDown(0.8);

    // Bukti pembayaran (gambar)
    if (buktiPath && fs.existsSync(buktiPath)) {
      try {
        doc.addPage();
        doc.fontSize(14).text('Bukti Pembayaran', { align: 'center' });
        doc.moveDown(0.5);
        doc.image(buktiPath, {
          fit: [450, 650],
          align: 'center',
          valign: 'center'
        });
        doc.moveDown(0.5);
      } catch (imgErr) {
        console.warn('Gagal sisipkan gambar ke PDF:', imgErr);
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('red').text('Gagal memuat gambar bukti ke PDF.', { align: 'center' });
        doc.fillColor('black');
      }
    } else {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('gray').text('Bukti pembayaran: -', { align: 'left' });
      doc.fillColor('black');
    }

    // Catatan admin
    const catatan = r.pembayaran_catatan || null;
    if (catatan) {
      doc.addPage();
      doc.fontSize(12).text('Catatan Admin', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(11).text(catatan);
    }

    doc.end();
  } catch (err) {
    console.error('Download PDF error:', err);
    req.flash('error_msg', 'Gagal membuat PDF. Silakan coba lagi.');
    return res.redirect('/pemain/riwayat-ulasan');
  }
});

module.exports = router;
