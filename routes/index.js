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

// Halaman Activity
router.get('/activity', (req, res) => {
  const activities = [
    {
      slug: 'futsal',
      nama: 'Futsal',
      ikon: 'bi-dribbble',
      gambar: '/images/activity/futsal.jpg',
      deskripsi: 'Permainan 5 lawan 5 di lapangan kecil yang melatih kelincahan, kecepatan, dan kerja sama tim.',
      manfaat: [
        'Meningkatkan daya tahan jantung dan paru-paru.',
        'Melatih koordinasi, kelincahan, dan refleks.',
        'Membantu membakar kalori dan menjaga berat badan.',
        'Mengembangkan kerja sama tim dan komunikasi.'
      ],
      prosedur: [
        'Lakukan pemanasan 5–10 menit: jogging ringan, stretching dinamis.',
        'Gunakan sepatu futsal dengan sol rata agar tidak mudah cedera.',
        'Mulai dengan permainan ringan sebelum intensitas tinggi.',
        'Akhiri dengan pendinginan dan stretching statis.'
      ],
      catatan: 'Hindari bermain di lantai yang licin dan gunakan pelindung tulang kering (shin guard).'
    },

    {
      slug: 'badminton',
      nama: 'Badminton',
      ikon: 'bi-lightning-charge',
      gambar: '/images/activity/badminton.jpg',
      deskripsi: 'Olahraga raket yang lincah dengan gerakan cepat maju-mundur dan menyamping.',
      manfaat: [
        'Menjaga kesehatan jantung dan pernapasan.',
        'Melatih kekuatan kaki dan lengan.',
        'Meningkatkan kelincahan dan koordinasi tubuh.',
        'Meningkatkan fokus dan konsentrasi.'
      ],
      prosedur: [
        'Pemanasan sendi lutut, pergelangan kaki, bahu, dan pergelangan tangan.',
        'Latihan footwork sederhana sebelum sparring.',
        'Gunakan sepatu khusus badminton/indoor court.',
        'Minum cukup air di sela permainan.'
      ],
      catatan: 'Perhatikan teknik mendarat saat lompat smash untuk menghindari cedera lutut.'
    },

    {
      slug: 'voli',
      nama: 'Bola Voli',
      ikon: 'bi-grid-3x3',
      gambar: '/images/activity/voli.jpg',
      deskripsi: 'Olahraga tim yang mengutamakan kerja sama dan koordinasi untuk menjaga bola tetap hidup di udara.',
      manfaat: [
        'Menguatkan otot kaki, lengan, dan bahu.',
        'Meningkatkan refleks dan koordinasi mata-tangan.',
        'Melatih kerja sama tim dan komunikasi.',
        'Membantu meningkatkan tinggi lompatan (vertical jump).'
      ],
      prosedur: [
        'Pemanasan penuh tubuh, terutama bahu, lutut, dan pergelangan kaki.',
        'Latihan passing dan servis dasar sebelum mulai game.',
        'Gunakan sepatu court dengan grip baik.',
        'Hindari mendarat dengan satu kaki saat block atau spike.'
      ],
      catatan: 'Jika punya riwayat cedera bahu atau lutut, kurangi intensitas smash dan block.'
    },

    {
      slug: 'tenis',
      nama: 'Tenis',
      ikon: 'bi-record-circle',
      gambar: '/images/activity/tenis.jpg',
      deskripsi: 'Olahraga raket yang melatih kekuatan, kecepatan, dan konsentrasi dengan intensitas sedang hingga tinggi.',
      manfaat: [
        'Meningkatkan stamina dan kesehatan jantung.',
        'Menguatkan otot lengan, kaki, dan core.',
        'Melatih koordinasi tangan-mata.',
        'Meningkatkan daya fokus dan refleks cepat.'
      ],
      prosedur: [
        'Pemanasan sendi bahu, pergelangan, pinggang, dan lutut.',
        'Mulai pukulan dasar seperti forehand & backhand.',
        'Gunakan sepatu tenis agar tidak selip.',
        'Hindari gerakan memutar berlebihan pada pinggang.'
      ],
      catatan: 'Pemanasan wajib untuk mencegah cedera bahu, terutama saat servis.'
    },

    // ====================
    // 5. Basket (Baru)
    // ====================
    {
      slug: 'basket',
      nama: 'Basket',
      ikon: 'bi-basket3-fill',
      gambar: '/images/activity/basket.jpg',
      deskripsi: 'Olahraga tim yang menggabungkan lompatan, kecepatan, dan strategi dalam mencetak poin.',
      manfaat: [
        'Menguatkan otot kaki dan tubuh bagian atas.',
        'Melatih keseimbangan dan koordinasi.',
        'Meningkatkan stamina dan daya tahan.',
        'Melatih kerja sama tim dan komunikasi.',
        'Meningkatkan akurasi dan fokus dalam permainan.'
      ],
      prosedur: [
        'Lakukan pemanasan 5–10 menit (dribble, jogging, stretching).',
        'Gunakan sepatu basket dengan ankle support.',
        'Latihan dasar: passing, dribble, shooting.',
        'Mendarat dengan lutut sedikit menekuk agar aman.',
        'Pendinginan minimal 5 menit setelah bermain.'
      ],
      catatan: 'Berhati-hatilah saat melakukan lompatan agar tidak cedera ankle.'
    },

    // ====================
    // 6. Bisbol (Baru)
    // ====================
    {
      slug: 'bisbol',
      nama: 'Bisbol',
      ikon: 'bi-emoji-sunglasses-fill',
      gambar: '/images/activity/bisbol.jpg',
      deskripsi: 'Olahraga pukul-lari yang melatih kekuatan tangan, fokus, dan koordinasi mata-tangan.',
      manfaat: [
        'Meningkatkan kekuatan lengan dan bahu.',
        'Melatih refleks cepat dan fokus.',
        'Menguatkan otot kaki saat sprint.',
        'Memperkuat kerja sama tim dan strategi.',
        'Meningkatkan koordinasi tubuh keseluruhan.'
      ],
      prosedur: [
        'Pemanasan bahu, lengan, dan pinggang.',
        'Latihan pukulan ringan dan lempar tangkap.',
        'Gunakan glove & bat yang sesuai.',
        'Selalu perhatikan arah bola saat permainan.',
        'Akhiri sesi dengan stretching bahu dan lengan.'
      ],
      catatan: 'Gunakan helm pelindung saat bermain versi kompetitif.'
    }
  ];

  res.render('activity/index', {
    title: 'Activity & Manfaat Olahraga',
    activities
  });
});

module.exports = router;