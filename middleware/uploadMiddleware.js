// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// 1. Tentukan lokasi penyimpanan DULU
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/arena/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'arena-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Tentukan filter file KEMUDIAN
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true); // Terima file
  } else {
    cb(new Error('Hanya file JPEG, JPG, atau PNG yang diizinkan!'), false); // Tolak file
  }
};

// 3. BARU buat konfigurasi upload utama
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Batas 5MB
  }
});

// 4. Terakhir, export
module.exports = upload;