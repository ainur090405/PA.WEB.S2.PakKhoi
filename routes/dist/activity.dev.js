"use strict";

// routes/activity.js
var express = require('express');

var router = express.Router();
var activities = [{
  slug: 'futsal',
  nama: 'Futsal',
  ikon: 'bi-dribbble',
  gambar: '/images/activity/futsal.jpg',
  deskripsi: 'Permainan 5 lawan 5 di lapangan kecil yang melatih kelincahan, kecepatan, dan kerja sama tim.',
  manfaat: ['Meningkatkan daya tahan jantung dan paru-paru.', 'Melatih koordinasi, kelincahan, dan refleks.', 'Membantu mengontrol berat badan dan meningkatkan metabolisme.', 'Mengembangkan kerja sama tim dan komunikasi.'],
  prosedur: ['Lakukan pemanasan 5–10 menit: jogging ringan, stretching dinamis.', 'Gunakan sepatu futsal dengan sol rata agar kaki tetap stabil.', 'Atur durasi permainan dan intensitas sesuai kemampuan.', 'Akhiri dengan pendinginan dan stretching otot kaki.'],
  catatan: 'Hindari bermain di alas yang licin dan gunakan pelindung tulang kering (shin guard).'
}, {
  slug: 'badminton',
  nama: 'Badminton',
  ikon: 'bi-lightning-charge',
  gambar: '/images/activity/badminton.jpg',
  deskripsi: 'Olahraga raket yang cepat dengan gerakan eksplosif maju-mundur dan menyamping.',
  manfaat: ['Menjaga kesehatan jantung dan pernapasan.', 'Melatih kelincahan kaki dan lengan.', 'Meningkatkan keseimbangan dan koordinasi tubuh.', 'Meningkatkan fokus dan konsentrasi.'],
  prosedur: ['Pemanasan sendi kecil: pergelangan kaki, bahu, dan pergelangan tangan.', 'Latihan footwork sederhana sebelum sparring.', 'Gunakan sepatu khusus badminton/court.', 'Minum cukup air di sela permainan.'],
  catatan: 'Perhatikan teknik overhead agar bahu tidak cepat lelah atau mengalami cedera otot.'
}, {
  slug: 'basket',
  nama: 'Basket',
  ikon: 'bi-basket2-fill',
  gambar: '/images/activity/basket.jpg',
  deskripsi: 'Olahraga tim yang menggabungkan lompatan, kecepatan, dan akurasi tembakan ke ring.',
  manfaat: ['Menguatkan otot kaki, lengan, dan badan bagian atas.', 'Melatih koordinasi mata-tangan dan keseimbangan tubuh.', 'Meningkatkan daya tahan dan kecepatan berlari.', 'Mendorong kerja sama tim dan komunikasi.'],
  prosedur: ['Pemanasan: jogging ringan dan dribbling selama 5–10 menit.', 'Latihan teknik dasar: passing, dribble, dan shooting.', 'Gunakan sepatu basket dengan ankle support yang baik.', 'Lakukan pendinginan setelah bermain, terutama otot paha dan betis.'],
  catatan: 'Hati-hati saat mendarat setelah melompat, tekuk lutut sedikit untuk mengurangi benturan.'
}, {
  slug: 'voli',
  nama: 'Bola Voli',
  ikon: 'bi-shield-fill-check',
  gambar: '/images/activity/voli.jpg',
  deskripsi: 'Olahraga tim yang mengutamakan lompatan, refleks, dan koordinasi untuk menjaga bola tetap di udara.',
  manfaat: ['Menguatkan otot kaki, lengan, dan bahu.', 'Meningkatkan koordinasi tangan-mata.', 'Membantu menjaga keseimbangan dan postur tubuh.', 'Meningkatkan kemampuan komunikasi dan kerja sama tim.'],
  prosedur: ['Pemanasan pergelangan tangan, bahu, dan lutut sebelum bermain.', 'Mulai dengan latihan passing (bump) dan servis ringan.', 'Gunakan sepatu dengan grip baik agar tidak mudah terpeleset.', 'Lakukan stretching setelah bermain untuk mencegah kram otot.'],
  catatan: 'Jika punya riwayat cedera bahu atau lutut, kurangi intensitas smash dan blok.'
}, {
  slug: 'tenis',
  nama: 'Tenis',
  ikon: 'bi-record-circle',
  gambar: '/images/activity/tenis.jpg',
  deskripsi: 'Olahraga raket yang melatih kekuatan, kecepatan, dan konsentrasi dengan intensitas sedang hingga tinggi.',
  manfaat: ['Meningkatkan stamina dan kesehatan jantung.', 'Menguatkan otot lengan, kaki, dan core.', 'Melatih koordinasi tangan-mata.', 'Meningkatkan daya fokus dan refleks cepat.'],
  prosedur: ['Pemanasan sendi bahu, pergelangan, pinggang, dan lutut.', 'Latihan pukulan dasar seperti forehand dan backhand.', 'Gunakan sepatu tenis agar tidak mudah selip.', 'Hindari gerakan memutar berlebihan pada pinggang saat memukul bola.'],
  catatan: 'Pemanasan bahu wajib untuk mencegah cedera, terutama saat servis berulang.'
}, {
  slug: 'bisbol',
  nama: 'Bisbol',
  ikon: 'bi-emoji-sunglasses-fill',
  gambar: '/images/activity/bisbol.jpg',
  deskripsi: 'Olahraga yang menggabungkan pukulan, lemparan, dan lari cepat dalam format permainan tim.',
  manfaat: ['Meningkatkan koordinasi mata-tangan saat memukul bola.', 'Menguatkan otot bahu, lengan, dan punggung atas.', 'Melatih fokus dan kemampuan membaca arah bola.', 'Meningkatkan kecepatan sprint dan kelincahan.'],
  prosedur: ['Pemanasan khusus untuk bahu, siku, dan pergelangan tangan.', 'Gunakan glove dan bat yang sesuai ukuran tubuh.', 'Latihan lempar-tangkap dan pukulan ringan sebelum mulai game.', 'Selalu waspadai arah bola untuk menghindari benturan.'],
  catatan: 'Gunakan helm pelindung jika bermain kompetitif dan selalu perhatikan area sekitar sebelum memukul bola.'
}]; // Halaman utama activity

router.get('/', function (req, res) {
  res.render('activity/index', {
    title: 'Aktivitas & Panduan Olahraga',
    activities: activities
  });
});
module.exports = router;
//# sourceMappingURL=activity.dev.js.map
