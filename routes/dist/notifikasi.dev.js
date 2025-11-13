"use strict";

var express = require('express');

var router = express.Router();

var Model_Notifikasi = require('../models/Model_Notifikasi');

var _require = require('../middleware/authMiddleware'),
    isAuthenticated = _require.isAuthenticated; // GET: Ambil notifikasi user (untuk AJAX)


router.get('/get', isAuthenticated, function _callee(req, res) {
  var id_user, notifications, unreadCount;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          id_user = req.session.user.id;
          _context.next = 4;
          return regeneratorRuntime.awrap(Model_Notifikasi.getByUser(id_user));

        case 4:
          notifications = _context.sent;
          _context.next = 7;
          return regeneratorRuntime.awrap(Model_Notifikasi.getUnreadCount(id_user));

        case 7:
          unreadCount = _context.sent;
          res.json({
            notifications: notifications,
            unreadCount: unreadCount
          });
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          res.status(500).json({
            error: 'Gagal mengambil notifikasi'
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // POST: Tandai notifikasi sebagai dibaca

router.post('/mark-read/:id', isAuthenticated, function _callee2(req, res) {
  var id_notifikasi;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          id_notifikasi = req.params.id;
          _context2.next = 4;
          return regeneratorRuntime.awrap(Model_Notifikasi.markAsRead(id_notifikasi));

        case 4:
          res.json({
            success: true
          });
          _context2.next = 11;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          res.status(500).json({
            error: 'Gagal menandai notifikasi'
          });

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // POST: Tandai semua notifikasi sebagai dibaca

router.post('/mark-all-read', isAuthenticated, function _callee3(req, res) {
  var id_user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          id_user = req.session.user.id;
          _context3.next = 4;
          return regeneratorRuntime.awrap(Model_Notifikasi.markAllAsRead(id_user));

        case 4:
          res.json({
            success: true
          });
          _context3.next = 11;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          res.status(500).json({
            error: 'Gagal menandai semua notifikasi'
          });

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
module.exports = router;
//# sourceMappingURL=notifikasi.dev.js.map
