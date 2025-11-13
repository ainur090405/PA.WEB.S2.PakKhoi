"use strict";

var express = require('express');

var router = express.Router(); // Kita butuh Model_Arena untuk mengambil data "Arena Populer"

var Model_Arena = require('../models/Model_Arena');
/* GET home page (index). */


router.get('/', function _callee(req, res, next) {
  var featuredArenas;
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
          return regeneratorRuntime.awrap(Model_Arena.getFeatured());

        case 5:
          featuredArenas = _context.sent;
          res.render('index', {
            title: 'Selamat Datang di ArenaGo',
            arenas: featuredArenas // Kirim data arena ke EJS

          });
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          next(_context.t0); // Kirim error ke halaman error EJS

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
/* GET activity page. */

router.get('/activity', function (req, res, next) {
  res.render('activity', {
    title: 'Activity - ArenaGo'
  });
});
module.exports = router;
//# sourceMappingURL=index.dev.js.map
