var express = require('express');
var router = express.Router();
// Kita butuh Model_Arena untuk mengambil data "Arena Populer"
const Model_Arena = require('../models/Model_Arena');

/* GET home page (index). */
router.get('/', async function(req, res, next) {
  try {
    // 1. Cek dulu jika yang login adalah ADMIN
    if (req.session.user && req.session.user.role === 'admin') {
      // Jika Admin, lempar ke Dashboard-nya
      return res.redirect('/admin/dashboard');
    }

    // 2. Jika GUEST atau PEMAIN, tampilkan Halaman Home
    // Ambil 3 arena dengan foto untuk ditampilkan sebagai "Rekomendasi"
    const featuredArenas = await Model_Arena.getFeatured();

    res.render('index', {
      title: 'Selamat Datang di ArenaGo',
      arenas: featuredArenas // Kirim data arena ke EJS
    });

  } catch (err) {
    console.error(err);
    next(err); // Kirim error ke halaman error EJS
  }
});

/* GET activity page. */
router.get('/activity', function(req, res, next) {
  res.render('activity', {
    title: 'Activity - ArenaGo'
  });
});

module.exports = router;