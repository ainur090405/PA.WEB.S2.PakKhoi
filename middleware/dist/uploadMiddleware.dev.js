"use strict";

// middleware/uploadMiddleware.js
var multer = require('multer');

var path = require('path'); // ==============================
// STORAGE UNTUK FOTO ARENA
// ==============================


var storageArena = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/arena/'));
  },
  filename: function filename(req, file, cb) {
    var unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'arena-' + unique + path.extname(file.originalname));
  }
}); // ==============================
// STORAGE UNTUK BUKTI PEMBAYARAN
// ==============================

var storageBukti = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/bukti_pembayaran/'));
  },
  filename: function filename(req, file, cb) {
    var unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bukti_' + unique + path.extname(file.originalname));
  }
}); // ==============================
// FILTER FILE GAMBAR
// ==============================

var fileFilter = function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file JPG, JPEG, PNG yang diizinkan!'), false);
  }
}; // ==============================
// MIDDLEWARE UPLOAD ARENA
// ==============================


var uploadArena = multer({
  storage: storageArena,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
}); // ==============================
// MIDDLEWARE UPLOAD BUKTI PEMBAYARAN
// ==============================

var uploadBuktiPembayaran = multer({
  storage: storageBukti,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
}); // EXPORT

module.exports = {
  uploadArena: uploadArena,
  uploadBuktiPembayaran: uploadBuktiPembayaran
};
//# sourceMappingURL=uploadMiddleware.dev.js.map
