// routes/venues.js
const express = require('express');
const router = express.Router();
const Model_Arena = require('../models/Model_Arena');
const Model_Jadwal = require('../models/Model_Jadwal');
const Model_FotoArena = require('../models/Model_FotoArena');
const Model_Ulasan = require('../models/Model_Ulasan');

// GET: Halaman "Cari Arena" (Etalase)
router.get('/', async (req, res) => {
  try {
    const filter = {
      lokasi: req.query.lokasi || null,
      jenis: req.query.jenis || null
    };

    const [arenaData, jenisList] = await Promise.all([
      Model_Arena.getPublic(filter),
      Model_Arena.getJenisOlahragaList()
    ]);

    res.render('venues/index', {
      title: 'Cari Arena',
      data: arenaData,
      jenisList: jenisList,
      filter: filter
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat halaman arena.');
    res.redirect('/');
  }
});

// ==========================================================
// GET: Halaman Detail 1 Arena (UPDATED WITH REVIEWS)
// ==========================================================
router.get('/detail/:id', async (req, res) => {
  try {
    const id_arena = req.params.id;

    // Get all data simultaneously
    const [
      arenaData,
      jadwalData,
      fotoData,
      reviewsData,
      ratingData
    ] = await Promise.all([
      Model_Arena.getById(id_arena),
      Model_Jadwal.getAvailableByArenaId(id_arena),
      Model_FotoArena.getByArenaId(id_arena),
      Model_Ulasan.getByArena(id_arena),
      Model_Ulasan.getAverageRating(id_arena)
    ]);

    if (arenaData.length === 0) {
      req.flash('error_msg', 'Arena tidak ditemukan.');
      return res.redirect('/venues');
    }

    // Send all data to view
    res.render('venues/detail', {
      title: arenaData[0].nama_arena,
      arena: arenaData[0],
      jadwal: jadwalData,
      fotoList: fotoData,
      reviews: reviewsData,
      avgRating: ratingData.avg_rating || 0,
      totalReviews: ratingData.total_reviews || 0
    });

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memuat detail arena.');
    res.redirect('/venues');
  }
});

module.exports = router;
