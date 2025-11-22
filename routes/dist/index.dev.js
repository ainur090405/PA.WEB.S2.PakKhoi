"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var express = require('express');

var router = express.Router(); // Koneksi DB

var connection = require('../config/database'); // Model Arena


var Model_Arena = require('../models/Model_Arena'); // helper query pakai Promise


function runQuery(sql) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return new Promise(function (resolve, reject) {
    connection.query(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
/* GET home page (index). */


router.get('/', function _callee(req, res, next) {
  var featuredArenas, _ref, _ref2, rowArena, _ref3, _ref4, rowUser, _ref5, _ref6, rowBooking, _ref7, _ref8, rowRating, stats;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;

          if (!(req.session.user && req.session.user.role === 'admin')) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.redirect('/admin/dashboard'));

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(Model_Arena.getTopWithRating(3));

        case 5:
          featuredArenas = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(runQuery('SELECT COUNT(*) AS total FROM arena WHERE status = "aktif"'));

        case 8:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 1);
          rowArena = _ref2[0];
          _context.next = 13;
          return regeneratorRuntime.awrap(runQuery("SELECT COUNT(*) AS total FROM users WHERE role = 'pemain'"));

        case 13:
          _ref3 = _context.sent;
          _ref4 = _slicedToArray(_ref3, 1);
          rowUser = _ref4[0];
          _context.next = 18;
          return regeneratorRuntime.awrap(runQuery("SELECT COUNT(*) AS total FROM reservasi WHERE status = 'selesai'"));

        case 18:
          _ref5 = _context.sent;
          _ref6 = _slicedToArray(_ref5, 1);
          rowBooking = _ref6[0];
          _context.next = 23;
          return regeneratorRuntime.awrap(runQuery('SELECT AVG(rating) AS avg_rating FROM ulasan'));

        case 23:
          _ref7 = _context.sent;
          _ref8 = _slicedToArray(_ref7, 1);
          rowRating = _ref8[0];
          stats = {
            totalArena: rowArena ? rowArena.total || 0 : 0,
            totalUser: rowUser ? rowUser.total || 0 : 0,
            totalSelesai: rowBooking ? rowBooking.total || 0 : 0,
            // ⬅️ ganti nama di sini
            avgRating: rowRating && rowRating.avg_rating ? Number(rowRating.avg_rating) : 0
          };
          res.render('index', {
            title: 'Selamat Datang di ArenaGo',
            arenas: featuredArenas,
            // untuk "Rekomendasi Arena Teratas"
            stats: stats,
            // untuk "Kenapa Pilih ArenaGo?"
            user: req.session.user || null
          });
          _context.next = 34;
          break;

        case 30:
          _context.prev = 30;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          next(_context.t0); // Kirim error ke handler error EJS

        case 34:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 30]]);
}); // Halaman Activity (tetap seperti semula)

router.get('/activity', function (req, res) {
  var activities = [{
    slug: 'futsal',
    nama: 'Futsal',
    ikon: 'bi-dribbble',
    gambar: '/images/activity/futsal.jpg',
    deskripsi: 'Permainan 5 lawan 5 di lapangan kecil yang melatih kelincahan, kecepatan, dan kerja sama tim.',
    manfaat: ['Meningkatkan daya tahan jantung dan paru-paru.', 'Melatih koordinasi, kelincahan, dan refleks.', 'Membantu membakar kalori dan menjaga berat badan.', 'Mengembangkan kerja sama tim dan komunikasi.'],
    prosedur: ['Lakukan pemanasan 5–10 menit: jogging ringan, stretching dinamis.', 'Gunakan sepatu futsal dengan sol rata agar tidak mudah cedera.', 'Mulai dengan permainan ringan sebelum intensitas tinggi.', 'Akhiri dengan pendinginan dan stretching statis.'],
    catatan: 'Hindari bermain di lantai yang licin dan gunakan pelindung tulang kering (shin guard).'
  }, {
    slug: 'badminton',
    nama: 'Badminton',
    ikon: 'bi-lightning-charge',
    gambar: '/images/activity/badminton.jpg',
    deskripsi: 'Olahraga raket yang lincah dengan gerakan cepat maju-mundur dan menyamping.',
    manfaat: ['Menjaga kesehatan jantung dan pernapasan.', 'Melatih kekuatan kaki dan lengan.', 'Meningkatkan kelincahan dan koordinasi tubuh.', 'Meningkatkan fokus dan konsentrasi.'],
    prosedur: ['Pemanasan sendi lutut, pergelangan kaki, bahu, dan pergelangan tangan.', 'Latihan footwork sederhana sebelum sparring.', 'Gunakan sepatu khusus badminton/indoor court.', 'Minum cukup air di sela permainan.'],
    catatan: 'Perhatikan teknik mendarat saat lompat smash untuk menghindari cedera lutut.'
  }, {
    slug: 'voli',
    nama: 'Bola Voli',
    ikon: 'bi-grid-3x3',
    gambar: '/images/activity/voli.jpg',
    deskripsi: 'Olahraga tim yang mengutamakan kerja sama dan koordinasi untuk menjaga bola tetap hidup di udara.',
    manfaat: ['Menguatkan otot kaki, lengan, dan bahu.', 'Meningkatkan refleks dan koordinasi mata-tangan.', 'Melatih kerja sama tim dan komunikasi.', 'Membantu meningkatkan tinggi lompatan (vertical jump).'],
    prosedur: ['Pemanasan penuh tubuh, terutama bahu, lutut, dan pergelangan kaki.', 'Latihan passing dan servis dasar sebelum mulai game.', 'Gunakan sepatu court dengan grip baik.', 'Hindari mendarat dengan satu kaki saat block atau spike.'],
    catatan: 'Jika punya riwayat cedera bahu atau lutut, kurangi intensitas smash dan block.'
  }, {
    slug: 'tenis',
    nama: 'Tenis',
    ikon: 'bi-record-circle',
    gambar: '/images/activity/tenis.jpg',
    deskripsi: 'Olahraga raket yang melatih kekuatan, kecepatan, dan konsentrasi dengan intensitas sedang hingga tinggi.',
    manfaat: ['Meningkatkan stamina dan kesehatan jantung.', 'Menguatkan otot lengan, kaki, dan core.', 'Melatih koordinasi tangan-mata.', 'Meningkatkan daya fokus dan refleks cepat.'],
    prosedur: ['Pemanasan sendi bahu, pergelangan, pinggang, dan lutut.', 'Mulai pukulan dasar seperti forehand & backhand.', 'Gunakan sepatu tenis agar tidak selip.', 'Hindari gerakan memutar berlebihan pada pinggang.'],
    catatan: 'Pemanasan wajib untuk mencegah cedera bahu, terutama saat servis.'
  }, {
    slug: 'basket',
    nama: 'Basket',
    ikon: 'bi-basket3-fill',
    gambar: '/images/activity/basket.jpg',
    deskripsi: 'Olahraga tim yang menggabungkan lompatan, kecepatan, dan strategi dalam mencetak poin.',
    manfaat: ['Menguatkan otot kaki dan tubuh bagian atas.', 'Melatih keseimbangan dan koordinasi.', 'Meningkatkan stamina dan daya tahan.', 'Melatih kerja sama tim dan komunikasi.', 'Meningkatkan akurasi dan fokus dalam permainan.'],
    prosedur: ['Lakukan pemanasan 5–10 menit (dribble, jogging, stretching).', 'Gunakan sepatu basket dengan ankle support.', 'Latihan dasar: passing, dribble, shooting.', 'Mendarat dengan lutut sedikit menekuk agar aman.', 'Pendinginan minimal 5 menit setelah bermain.'],
    catatan: 'Berhati-hatilah saat melakukan lompatan agar tidak cedera ankle.'
  }, {
    slug: 'bisbol',
    nama: 'Bisbol',
    ikon: 'bi-emoji-sunglasses-fill',
    gambar: '/images/activity/bisbol.jpg',
    deskripsi: 'Olahraga pukul-lari yang melatih kekuatan tangan, fokus, dan koordinasi mata-tangan.',
    manfaat: ['Meningkatkan kekuatan lengan dan bahu.', 'Melatih refleks cepat dan fokus.', 'Menguatkan otot kaki saat sprint.', 'Memperkuat kerja sama tim dan strategi.', 'Meningkatkan koordinasi tubuh keseluruhan.'],
    prosedur: ['Pemanasan bahu, lengan, dan pinggang.', 'Latihan pukulan ringan dan lempar tangkap.', 'Gunakan glove & bat yang sesuai.', 'Selalu perhatikan arah bola saat permainan.', 'Akhiri sesi dengan stretching bahu dan lengan.'],
    catatan: 'Gunakan helm pelindung saat bermain versi kompetitif.'
  }];
  res.render('activity/index', {
    title: 'Activity & Manfaat Olahraga',
    activities: activities
  });
});
module.exports = router;
//# sourceMappingURL=index.dev.js.map
