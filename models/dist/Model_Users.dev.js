"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var connection = require('../config/database');

var Model_Users =
/*#__PURE__*/
function () {
  function Model_Users() {
    _classCallCheck(this, Model_Users);
  }

  _createClass(Model_Users, null, [{
    key: "getAll",
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
                  if (err) reject(err);else resolve(result);
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
    }
  }]);

  return Model_Users;
}();

module.exports = Model_Users;
//# sourceMappingURL=Model_Users.dev.js.map
