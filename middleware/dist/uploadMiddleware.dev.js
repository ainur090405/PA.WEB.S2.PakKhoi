"use strict";

// middleware/uploadMiddleware.js
var multer = require('multer');

var path = require('path'); // 1. Tentukan lokasi penyimpanan DULU


var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'public/uploads/arena/');
  },
  filename: function filename(req, file, cb) {
    var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'arena-' + uniqueSuffix + path.extname(file.originalname));
  }
}); // 2. Tentukan filter file KEMUDIAN

var fileFilter = function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true); // Terima file
  } else {
    cb(new Error('Hanya file JPEG, JPG, atau PNG yang diizinkan!'), false); // Tolak file
  }
}; // 3. BARU buat konfigurasi upload utama


var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Batas 5MB

  }
}); // 4. Terakhir, export

module.exports = upload;
//# sourceMappingURL=uploadMiddleware.dev.js.map
