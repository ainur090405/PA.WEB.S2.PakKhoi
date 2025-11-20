var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');


// Impor Rute
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users'); // Rute CRUD Master User
var authRouter = require('./routes/auth'); // Rute Login/Register
var adminRouter = require('./routes/admin'); // Rute Dashboard Admin
var pemainRouter = require('./routes/pemain'); // Rute Dashboard Pemain
var jadwalRouter = require('./routes/jadwal');
const reservasiRouter = require('./routes/reservasi');
var arenaRouter = require('./routes/arena');
var venuesRouter = require('./routes/venues');
var bookingRouter = require('./routes/booking');
var fotoRouter = require('./routes/foto');
var ulasanRouter = require('./routes/ulasan');
var pembayaranRouter = require('./routes/pembayaran');
var notifikasiRouter = require('./routes/notifikasi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files (including uploaded files under public/uploads)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Konfigurasi Session (Tanpa .env)
app.use(session({
  secret: 'kunci-rahasia-untuk-arenago-project', // Kunci rahasia
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set 'true' jika pakai HTTPS
    maxAge: 1000 * 60 * 60 * 24 // Cookie berlaku 1 hari
  }
}));

// Konfigurasi Flash Message
app.use(flash());

// ============================
// Pastikan folder upload ada
// ============================
const fs = require('fs');
const uploadsDirs = [
  path.join(__dirname, 'public', 'uploads'),
  path.join(__dirname, 'public', 'uploads', 'arena'),
  path.join(__dirname, 'public', 'uploads', 'bukti_pembayaran')
];

uploadsDirs.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('Membuat folder upload:', dir);
    }
  } catch (err) {
    console.error('Gagal membuat folder uploads:', dir, err);
  }
});

// [Middleware Global PENTING]
// Mengirim pesan flash & info user ke SEMUA file .ejs
app.use(async (req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null; // Info user yang login

  // Jika user adalah pemain, ambil notifikasi (opsional)
  if (req.session.user && req.session.user.role === 'pemain') {
    const Model_Notifikasi = require('./models/Model_Notifikasi');
    try {
      res.locals.notifications = await Model_Notifikasi.getByUser(req.session.user.id);
      res.locals.unreadCount = await Model_Notifikasi.getUnreadCount(req.session.user.id);
    } catch (err) {
      console.error('Error loading notifications:', err);
      res.locals.notifications = [];
      res.locals.unreadCount = 0;
    }
  } else {
    res.locals.notifications = [];
    res.locals.unreadCount = 0;
  }

  next();
});

// Pendaftaran Rute
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
app.use('/notifikasi', notifikasiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

const cron = require('node-cron');
const Model_Reservasi = require('./models/Model_Reservasi');

// Jalankan setiap 1 menit
cron.schedule('* * * * *', async () => {
  try {
    await Model_Reservasi.autoUpdateStatus();
    console.log('Auto update status selesai -', new Date());
  } catch (err) {
    console.error('Gagal auto update:', err);
  }
});

module.exports = app;
