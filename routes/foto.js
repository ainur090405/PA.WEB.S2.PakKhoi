const express = require('express');
const router = express.Router();
const Model_Arena = require('../models/Model_Arena');
const Model_FotoArena = require('../models/Model_FotoArena');
const { uploadArena } = require('../middleware/uploadMiddleware');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const fs = require('fs'); // Untuk hapus file
const path = require('path'); // Untuk hapus file

// Lindungi semua rute di file ini, hanya Admin
router.use(isAuthenticated, isAdmin);

/**
 * =======================================================
 * GET: Halaman Manajemen Galeri (Tampilan Utama)
 * =======================================================
 * Menampilkan form upload dan semua foto yang sudah ada
 * untuk satu arena spesifik.
 */
router.get('/manage/:id_arena', async (req, res) => {
  try {
    const id_arena = req.params.id_arena;
    
    // Ambil data arena (untuk judul) dan data foto (untuk galeri)
    const [arenaData, fotoData] = await Promise.all([
      Model_Arena.getById(id_arena),
      Model_FotoArena.getByArenaId(id_arena)
    ]);

    if (arenaData.length === 0) {
      req.flash('error_msg', 'Arena tidak ditemukan.');
      return res.redirect('/arena');
    }

    res.render('admin/foto/manage', {
      title: `Galeri Foto: ${arenaData[0].nama_arena}`,
      arena: arenaData[0], // Kirim data arena (untuk id_foto_cover)
      fotoList: fotoData // Kirim daftar foto
    });
  } catch (err) {
    req.flash('error_msg', 'Gagal memuat galeri: ' + err.message);
    res.redirect('/arena');
  }
});

/**
 * =======================================================
 * POST: Upload Foto Baru (Multi-Upload)
 * =======================================================
 * Menerima upload (bisa banyak file) dan menyimpannya.
 */
router.post('/store/:id_arena', uploadArena.array('foto_galeri', 10), async (req, res) => {
  // 'foto_galeri' adalah 'name' dari input file, '10' adalah batas max file
  const id_arena = req.params.id_arena;
  try {
    const deskripsi = req.body.deskripsi; // Ambil 1 deskripsi dari form

    if (!req.files || req.files.length === 0) {
      req.flash('error_msg', 'Anda tidak memilih file untuk di-upload.');
      return res.redirect(`/foto/manage/${id_arena}`);
    }

    // Loop semua file yang di-upload
    for (const file of req.files) {
      const dataFoto = {
        id_arena: id_arena,
        url_foto: '/uploads/arena/' + file.filename,
        deskripsi: deskripsi // Terapkan deskripsi yang sama ke semua foto
      };
      await Model_FotoArena.Store(dataFoto);
    }

    req.flash('success_msg', `${req.files.length} foto berhasil di-upload.`);
    res.redirect(`/foto/manage/${id_arena}`);

  } catch (err) {
    req.flash('error_msg', 'Gagal upload foto: ' + err.message);
    res.redirect(`/foto/manage/${id_arena}`);
  }
});

/**
 * =======================================================
 * GET: Hapus 1 Foto
 * =======================================================
 * Menghapus file fisik dari server DAN datanya dari DB.
 */
router.get('/delete/:id_arena/:id_foto', async (req, res) => {
  const { id_arena, id_foto } = req.params;
  try {
    // 1. Ambil data foto untuk dapat path file
    const fotoData = await Model_FotoArena.getById(id_foto);
    if (fotoData.length > 0 && fotoData[0].url_foto) {
      // 2. Hapus file fisik
      const filePath = path.join(__dirname, '../public', fotoData[0].url_foto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    // 3. Hapus data dari DB
    await Model_FotoArena.Delete(id_foto);
    req.flash('success_msg', 'Foto berhasil dihapus.');
    res.redirect(`/foto/manage/${id_arena}`);
  } catch (err) {
    req.flash('error_msg', 'Gagal menghapus foto.');
    res.redirect(`/foto/manage/${id_arena}`);
  }
});

/**
 * =======================================================
 * GET: Set 1 Foto sebagai Cover
 * =======================================================
 * Meng-update tabel 'arena' dengan 'id_foto_cover' yang baru.
 */
router.get('/setcover/:id_arena/:id_foto', async (req, res) => {
  const { id_arena, id_foto } = req.params;
  try {
    await Model_Arena.setCover(id_arena, id_foto);
    req.flash('success_msg', 'Foto cover berhasil diperbarui.');
    res.redirect(`/foto/manage/${id_arena}`);
  } catch (err) {
    req.flash('error_msg', 'Gagal set foto cover.');
    res.redirect(`/foto/manage/${id_arena}`);
  }
});

module.exports = router;