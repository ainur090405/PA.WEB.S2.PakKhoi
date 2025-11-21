"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// models/Model_Users.js
var connection = require('../config/database');

var bcrypt = require('bcryptjs'); // untuk hash password


var Model_Users =
/*#__PURE__*/
function () {
  function Model_Users() {
    _classCallCheck(this, Model_Users);
  }

  _createClass(Model_Users, null, [{
    key: "getAll",
    // =========================
    // FUNGSI EXISTING (TIDAK DIUBAH)
    // =========================
    value: function getAll() {
      return regeneratorRuntime.async(function getAll$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM users ORDER BY id_user DESC', function (err, rows) {
                  if (err) reject(err);else resolve(rows);
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
    key: "Store",
    value: function Store(Data) {
      return regeneratorRuntime.async(function Store$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('INSERT INTO users SET ?', Data, function (err, result) {
                  if (err) reject(err);else resolve(result);
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
    key: "getByEmail",
    value: function getByEmail(email) {
      return regeneratorRuntime.async(function getByEmail$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM users WHERE email = ?', [email], function (err, result) {
                  if (err) reject(err);else resolve(result); // array
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
    key: "getById",
    value: function getById(id) {
      return regeneratorRuntime.async(function getById$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM users WHERE id_user = ?', [id], function (err, result) {
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
    key: "Update",
    value: function Update(id, Data) {
      return regeneratorRuntime.async(function Update$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE users SET ? WHERE id_user = ?', [Data, id], function (err, result) {
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
  }, {
    key: "Delete",
    value: function Delete(id) {
      return regeneratorRuntime.async(function Delete$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('DELETE FROM users WHERE id_user = ?', [id], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      });
    } // =========================
    // TAMBAHAN UNTUK LUPA PASSWORD
    // =========================
    // Versi yang langsung balikin 1 user (bukan array)

  }, {
    key: "findOneByEmail",
    value: function findOneByEmail(email) {
      return regeneratorRuntime.async(function findOneByEmail$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email], function (err, rows) {
                  if (err) return reject(err);
                  resolve(rows[0] || null);
                });
              }));

            case 1:
            case "end":
              return _context7.stop();
          }
        }
      });
    } // Simpan token reset + waktu expired ke user

  }, {
    key: "setResetToken",
    value: function setResetToken(id_user, token, expiresDate) {
      return regeneratorRuntime.async(function setResetToken$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id_user = ?', [token, expiresDate, id_user], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context8.stop();
          }
        }
      });
    } // Cari user berdasarkan token reset yang masih berlaku

  }, {
    key: "findByResetToken",
    value: function findByResetToken(token) {
      return regeneratorRuntime.async(function findByResetToken$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", new Promise(function (resolve, reject) {
                connection.query("\n          SELECT * FROM users\n          WHERE reset_token = ?\n            AND reset_token_expires IS NOT NULL\n            AND reset_token_expires > NOW()\n          LIMIT 1\n        ", [token], function (err, rows) {
                  if (err) return reject(err);
                  resolve(rows[0] || null);
                });
              }));

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      });
    } // Hapus token reset setelah dipakai / kadaluarsa

  }, {
    key: "clearResetToken",
    value: function clearResetToken(id_user) {
      return regeneratorRuntime.async(function clearResetToken$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id_user = ?', [id_user], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 1:
            case "end":
              return _context10.stop();
          }
        }
      });
    } // Update password (plain → hash bcrypt) untuk lupa password

  }, {
    key: "updatePassword",
    value: function updatePassword(id_user, plainPassword) {
      var hash;
      return regeneratorRuntime.async(function updatePassword$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return regeneratorRuntime.awrap(bcrypt.hash(plainPassword, 10));

            case 2:
              hash = _context11.sent;
              return _context11.abrupt("return", new Promise(function (resolve, reject) {
                connection.query('UPDATE users SET password = ? WHERE id_user = ?', [hash, id_user], function (err, result) {
                  if (err) reject(err);else resolve(result);
                });
              }));

            case 4:
            case "end":
              return _context11.stop();
          }
        }
      });
    }
  }]);

  return Model_Users;
}();

module.exports = Model_Users;
//# sourceMappingURL=Model_Users.dev.js.map
