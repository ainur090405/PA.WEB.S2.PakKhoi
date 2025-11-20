const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Model_Users = require('../models/Model_Users'); 
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Lindungi semua rute di file ini
router.use(isAuthenticated, isAdmin);

// GET: Menampilkan daftar users
router.get('/', async (req, res) => {
  try {
    const users = await Model_Users.getAll();
    res.render('admin/users/index', {
      title: 'Manajemen User',
      data: users
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat data users.');
    res.redirect('/admin/dashboard');
  }
});

// GET: Form tambah user
router.get('/create', (req, res) => {
  res.render('admin/users/create', { title: 'Tambah User Baru' });
});

// POST: Simpan user baru
router.post('/store', async (req, res) => {
  const { nama, email, password, no_hp, role, status } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const dataUser = {
      nama,
      email,
      no_hp,
      role,
      password_hash: hash,
      tanggal_daftar: new Date(),
      // kalau form belum punya field status, default-kan aktif
      status: status || 'aktif'
    };

    await Model_Users.Store(dataUser);
    req.flash('success_msg', 'User baru berhasil ditambahkan.');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal menyimpan user: ' + (err.code || err.message));
    res.redirect('/users/create');
  }
});

// GET: Form edit user
router.get('/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const users = await Model_Users.getById(id);

    if (!users || users.length === 0) {
      req.flash('error_msg', 'User tidak ditemukan.');
      return res.redirect('/users');
    }

    res.render('admin/users/edit', {
      title: 'Edit User',
      user: users[0]
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat data user.');
    res.redirect('/users');
  }
});

// POST: Update user
router.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  const { nama, email, password, no_hp, role, status } = req.body;

  try {
    // data dasar
    const dataToUpdate = {
      nama,
      email,
      no_hp,
      role,
      status: status || 'aktif'   // <-- penting
    };

    // kalau password diisi, update juga password_hash
    if (password && password.trim() !== '') {
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }

    await Model_Users.Update(id, dataToUpdate);
    req.flash('success_msg', 'Data user berhasil diperbarui.');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memperbarui user: ' + (err.code || err.message));
    res.redirect('/users/edit/' + id);
  }
});

// GET: Hapus user
router.get('/delete/:id', async (req, res) => {
  const id = req.params.id;

  // cegah user menghapus dirinya sendiri
  if (Number(id) === Number(req.session.user.id)) {
    req.flash('error_msg', 'Anda tidak bisa menghapus akun Anda sendiri.');
    return res.redirect('/users');
  }

  try {
    await Model_Users.Delete(id);
    req.flash('success_msg', 'Data user berhasil dihapus.');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal menghapus user: ' + (err.code || err.message));
    res.redirect('/users');
  }
});

module.exports = router;
