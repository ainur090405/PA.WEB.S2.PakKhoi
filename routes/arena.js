const express = require('express');
const router = express.Router();
const Model_Arena = require('../models/Model_Arena');
const Model_FotoArena = require('../models/Model_FotoArena'); // Kita perlu ini untuk Hapus
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const fs = require('fs'); // Kita perlu ini untuk Hapus
const path = require('path'); // Kita perlu ini untuk Hapus

// HAPUS: 'upload' (multer) sudah tidak dipakai di sini

router.use(isAuthenticated, isAdmin);

// GET: Menampilkan daftar arena
router.get('/', async (req, res) => {
  try {
    const arena = await Model_Arena.getAll();
    res.render('admin/arena/index', {
      title: 'Manajemen Arena',
      data: arena
    });
  } catch (err) {
    req.flash('error_msg', 'Gagal memuat data arena.');
    res.redirect('/admin/dashboard');
  }
});

// GET: Form tambah arena
router.get('/create', (req, res) => {
  res.render('admin/arena/create', { title: 'Tambah Arena Baru' });
});

// POST: Simpan arena baru (Sudah Benar)
router.post('/store', async (req, res) => {
  try {
    const { nama_arena, jenis_olahraga, lokasi, harga, jam_buka, jam_tutup, status } = req.body;
    let dataArena = { nama_arena, jenis_olahraga, lokasi, harga, jam_buka, jam_tutup, status };
    const result = await Model_Arena.Store(dataArena);
    const newArenaId = result.insertId; 
    req.flash('success_msg', 'Arena baru berhasil ditambahkan. Sekarang, silakan upload foto galeri.');
    res.redirect(`/foto/manage/${newArenaId}`); 
  } catch (err) {
    req.flash('error_msg', 'Gagal menyimpan arena: ' + err.code);
    res.redirect('/arena/create');
  }
});

// GET: Form edit arena (Sudah Benar)
router.get('/edit/:id', async (req, res) => {
  try {
    const arena = await Model_Arena.getById(req.params.id);
    if (arena.length === 0) {
      req.flash('error_msg', 'Arena tidak ditemukan.');
      return res.redirect('/arena');
    }
    res.render('admin/arena/edit', {
      title: 'Edit Arena',
      arena: arena[0]
    });
  } catch (err) {
    req.flash('error_msg', 'Gagal memuat data arena.');
    res.redirect('/arena');
  }
});

// ===================================
// POST: Update arena (INI PERBAIKANNYA)
// ===================================
router.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // 1. Ambil data teks dari form
    const { nama_arena, jenis_olahraga, lokasi, harga, jam_buka, jam_tutup, status } = req.body;
    
    // 2. Buat variabel dengan nama yang benar (misal: 'dataUpdate')
    let dataUpdate = { nama_arena, jenis_olahraga, lokasi, harga, jam_buka, jam_tutup, status };

    // 3. Kirim variabel 'dataUpdate' ke model
    await Model_Arena.Update(id, dataUpdate); // <-- DIUBAH
    
    req.flash('success_msg', 'Data arena berhasil diperbarui.');
    res.redirect('/arena');
  } catch (err) {
    req.flash('error_msg', 'Gagal memperbarui arena: ' + err.code);
    res.redirect('/arena/edit/' + id);
  }
});
// ===================================
// AKHIR PERBAIKAN
// ===================================

// GET: Hapus arena (Sudah Benar)
router.get('/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const fotoList = await Model_FotoArena.getByArenaId(id);
    if (fotoList.length > 0) {
      fotoList.forEach(foto => {
        if (foto.url_foto) {
          const filePath = path.join(__dirname, '../public', foto.url_foto);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
          }
        }
      });
    }
    await Model_Arena.Delete(id);
    req.flash('success_msg', 'Data arena dan semua fotonya berhasil dihapus.');
    res.redirect('/arena');
  } catch (err) {
    req.flash('error_msg', 'Gagal menghapus arena: ' + err.code);
    res.redirect('/arena');
  }
});

router.get('/api/:id', async (req, res) => {
  try {
    const arena = await Model_Arena.getById(req.params.id);
    if (arena.length > 0) {
      return res.json(arena[0]); // ✅ gunakan return untuk hentikan eksekusi setelah kirim respons
    } else {
      return res.status(404).json({ message: 'Arena tidak ditemukan' });
    }
  } catch (err) {
    console.error('Error API /arena/api/:id:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;