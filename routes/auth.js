const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Model_Users = require('../models/Model_Users'); 

// =====================
// REGISTER
// =====================
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Daftar Akun' });
});

router.post('/register', async (req, res) => {
  const { nama, email, password, konfirmasi_password, no_hp } = req.body;

  if (!nama || !email || !password || !no_hp) {
    req.flash('error_msg', 'Semua field wajib diisi.');
    return res.redirect('/auth/register');
  }

  if (password !== konfirmasi_password) {
    req.flash('error_msg', 'Password dan konfirmasi password tidak cocok.');
    return res.redirect('/auth/register');
  }

  try {
    const users = await Model_Users.getByEmail(email);
    if (users.length > 0) {
      req.flash('error_msg', 'Email sudah terdaftar.');
      return res.redirect('/auth/register');
    }

    const hash = await bcrypt.hash(password, 10);
    const dataUser = {
      nama,
      email,
      no_hp,
      password_hash: hash,
      role: 'pemain',
      status: 'aktif',                 // ✅ default akun baru = aktif
      tanggal_daftar: new Date()
    };
    
    await Model_Users.Store(dataUser);
    
    req.flash('success_msg', 'Registrasi berhasil. Silakan login.');
    res.redirect('/auth/login');

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Terjadi kesalahan server: ' + err.code);
    res.redirect('/auth/register');
  }
});

// =====================
// LOGIN
// =====================
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await Model_Users.getByEmail(email);
    if (users.length === 0) {
      req.flash('error_msg', 'Email atau Password salah.');
      return res.redirect('/auth/login');
    }
    
    const user = users[0];

    // ✅ BLOKIR USER NONAKTIF
    if (user.status === 'nonaktif') {
      req.flash('error_msg', 'Akun Anda tidak aktif. Silakan hubungi admin.');
      return res.redirect('/auth/login');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      req.flash('error_msg', 'Email atau Password salah.');
      return res.redirect('/auth/login');
    }

    req.session.user = {
      id: user.id_user,
      nama: user.nama,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', 'Login berhasil! Selamat datang, ' + user.nama);

    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/');
    }
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Terjadi kesalahan server.');
    res.redirect('/auth/login');
  }
});

// =====================
// LOGOUT
// =====================
router.get('/logout', (req, res) => {
  req.flash('success_msg', 'Anda berhasil logout.');
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.clearCookie('connect.sid'); 
    res.redirect('/auth/login');
  });
});

module.exports = router;
