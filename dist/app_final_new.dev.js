"use strict";

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var session = require('express-session');

var flash = require('connect-flash'); // Impor Rute


var indexRouter = require('./routes/index');

var usersRouter = require('./routes/users'); // Rute CRUD Master User


var authRouter = require('./routes/auth'); // Rute Login/Register


var adminRouter = require('./routes/admin'); // Rute Dashboard Admin


var pemainRouter = require('./routes/pemain'); // Rute Dashboard Pemain


var jadwalRouter = require('./routes/jadwal');

var reservasiRouter = require('./routes/reservasi');

var arenaRouter = require('./routes/arena');

var venuesRouter = require('./routes/venues');

var bookingRouter = require('./routes/booking');

var fotoRouter = require('./routes/foto');

var ulasanRouter = require('./routes/ulasan');

var pembayaranRouter = require('./routes/pembayaran');

var notifikasiRouter = require('./routes/notifikasi');

var app = express(); // view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express["static"](path.join(__dirname, 'public'))); // Konfigurasi Session (Tanpa .env)

app.use(session({
  secret: 'kunci-rahasia-untuk-arenago-project',
  // Kunci rahasia
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    // Set 'true' jika pakai HTTPS
    maxAge: 1000 * 60 * 60 * 24 // Cookie berlaku 1 hari

  }
})); // Konfigurasi Flash Message

app.use(flash()); // [Middleware Global PENTING]
// Mengirim pesan flash & info user ke SEMUA file .ejs

app.use(function _callee(req, res, next) {
  var Model_Notifikasi;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          res.locals.success_msg = req.flash('success_msg');
          res.locals.error_msg = req.flash('error_msg');
          res.locals.user = req.session.user || null; // Info user yang login
          // Jika user adalah pemain, ambil notifikasi

          if (!(req.session.user && req.session.user.role === 'pemain')) {
            _context.next = 21;
            break;
          }

          Model_Notifikasi = require('./models/Model_Notifikasi_new');
          _context.prev = 5;
          _context.next = 8;
          return regeneratorRuntime.awrap(Model_Notifikasi.getByUser(req.session.user.id));

        case 8:
          res.locals.notifications = _context.sent;
          _context.next = 11;
          return regeneratorRuntime.awrap(Model_Notifikasi.getUnreadCount(req.session.user.id));

        case 11:
          res.locals.unreadCount = _context.sent;
          _context.next = 19;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](5);
          console.error('Error loading notifications:', _context.t0);
          res.locals.notifications = [];
          res.locals.unreadCount = 0;

        case 19:
          _context.next = 23;
          break;

        case 21:
          res.locals.notifications = [];
          res.locals.unreadCount = 0;

        case 23:
          next();

        case 24:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[5, 14]]);
}); // Pendaftaran Rute

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/pemain', pemainRouter);
app.use('/users', usersRouter); // Ini untuk CRUD Master User oleh Admin

app.use('/arena', arenaRouter);
app.use('/admin/reservasi', reservasiRouter);
app.use('/jadwal', jadwalRouter);
app.use('/venues', venuesRouter);
app.use('/booking', bookingRouter);
app.use('/foto', fotoRouter);
app.use('/ulasan', ulasanRouter);
app.use('/admin/pembayaran', pembayaranRouter);
app.use('/notifikasi', notifikasiRouter); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.render('error', {
    title: 'Error'
  });
});
module.exports = app; // Start server

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server running on port ".concat(port));
});
//# sourceMappingURL=app_final_new.dev.js.map
