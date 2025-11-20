// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// ==============================
// STORAGE UNTUK FOTO ARENA
// ==============================
const storageArena = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/arena/'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'arena-' + unique + path.extname(file.originalname));
  }
});

// ==============================
// STORAGE UNTUK BUKTI PEMBAYARAN
// ==============================
const storageBukti = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/bukti_pembayaran/'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bukti_' + unique + path.extname(file.originalname));
  }
});

// ==============================
// FILTER FILE GAMBAR
// ==============================
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file JPG, JPEG, PNG yang diizinkan!'), false);
  }
};

// ==============================
// MIDDLEWARE UPLOAD ARENA
// ==============================
const uploadArena = multer({
  storage: storageArena,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
});

// ==============================
// MIDDLEWARE UPLOAD BUKTI PEMBAYARAN
// ==============================
const uploadBuktiPembayaran = multer({
  storage: storageBukti,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
});

// EXPORT
module.exports = {
  uploadArena,
  uploadBuktiPembayaran
};
