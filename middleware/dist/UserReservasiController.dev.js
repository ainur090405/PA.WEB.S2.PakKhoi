"use strict";

// controllers/UserReservasiController.js
var Model_Reservasi = require('../models/Model_Reservasi');

module.exports = {
  // GET: tampilkan reservasi user login
  index: function index(req, res) {
    var id_user, reservasi;
    return regeneratorRuntime.async(function index$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            id_user = req.session.user.id_user;
            _context.next = 4;
            return regeneratorRuntime.awrap(Model_Reservasi.getByUser(id_user));

          case 4:
            reservasi = _context.sent;
            res.render('user/reservasi/index', {
              title: 'Reservasi Saya',
              data: reservasi
            });
            _context.next = 13;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);
            req.flash('error_msg', 'Gagal memuat data reservasi.');
            res.redirect('/');

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 8]]);
  },
  // POST: simpan reservasi baru
  store: function store(req, res) {
    var _req$body, id_arena, id_jadwal, data;

    return regeneratorRuntime.async(function store$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _req$body = req.body, id_arena = _req$body.id_arena, id_jadwal = _req$body.id_jadwal;
            data = {
              id_user: req.session.user.id_user,
              id_arena: id_arena,
              id_jadwal: id_jadwal,
              status: 'menunggu',
              tanggal_pesan: new Date()
            };
            _context2.next = 5;
            return regeneratorRuntime.awrap(Model_Reservasi.Store(data));

          case 5:
            req.flash('success_msg', 'Reservasi berhasil dibuat! Menunggu konfirmasi admin.');
            res.redirect('/user/reservasi');
            _context2.next = 14;
            break;

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](0);
            console.error(_context2.t0);
            req.flash('error_msg', 'Gagal membuat reservasi: ' + _context2.t0.message);
            res.redirect('back');

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[0, 9]]);
  }
};
//# sourceMappingURL=UserReservasiController.dev.js.map
