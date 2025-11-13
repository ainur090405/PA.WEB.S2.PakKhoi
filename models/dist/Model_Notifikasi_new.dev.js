"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var connection = require('../config/database');

var Model_Notifikasi =
/*#__PURE__*/
function () {
  function Model_Notifikasi() {
    _classCallCheck(this, Model_Notifikasi);
  }

  _createClass(Model_Notifikasi, null, [{
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO notifikasi SET ?', Data, function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }, {
    key: "getByUser",
    value: function getByUser(id_user) {
      return regeneratorRuntime.async(function getByUser$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "SELECT * FROM notifikasi WHERE id_user = ? ORDER BY id_notifikasi DESC LIMIT 10";
                connection.query(sql, [id_user], function (err, rows) {
                  if (err) reject(err);else resolve(rows);
                });
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }, {
    key: "getUnreadCount",
    value: function getUnreadCount(id_user) {
      return regeneratorRuntime.async(function getUnreadCount$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                var sql = "SELECT COUNT(*) as count FROM notifikasi WHERE id_user = ? AND dibaca = 0";
                connection.query(sql, [id_user], function (err, rows) {
                  if (err) reject(err);else resolve(rows[0].count);
                });
              }));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    }
  }, {
    key: "markAsRead",
    value: function markAsRead(id_notifikasi) {
      return regeneratorRuntime.async(function markAsRead$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE notifikasi SET dibaca = 1 WHERE id_notifikasi = ?', [id_notifikasi], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      });
    }
  }, {
    key: "markAllAsRead",
    value: function markAllAsRead(id_user) {
      return regeneratorRuntime.async(function markAllAsRead$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE notifikasi SET dibaca = 1 WHERE id_user = ?', [id_user], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      });
    }
  }]);

  return Model_Notifikasi;
}();

module.exports = Model_Notifikasi;
//# sourceMappingURL=Model_Notifikasi_new.dev.js.map
