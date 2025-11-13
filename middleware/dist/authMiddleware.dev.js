"use strict";

// Cek apakah user sudah login
var isAuthenticated = function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }

  req.flash('error_msg', 'Anda harus login untuk mengakses halaman ini.');
  res.redirect('/auth/login');
}; // Cek role Admin


var isAdmin = function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next(); // Lanjut jika rolenya 'admin'
  }

  req.flash('error_msg', 'Akses ditolak. Halaman ini khusus Admin.');
  res.redirect('/pemain/dashboard'); // Redirect pemain ke dashboardnya
}; // Cek role Pemain


var isPemain = function isPemain(req, res, next) {
  if (req.session.user && req.session.user.role === 'pemain') {
    return next(); // Lanjut jika rolenya 'pemain'
  }

  req.flash('error_msg', 'Akses ditolak. Halaman ini khusus Pemain.');
  res.redirect('/admin/dashboard');
};

module.exports = {
  isAuthenticated: isAuthenticated,
  isAdmin: isAdmin,
  isPemain: isPemain
};
//# sourceMappingURL=authMiddleware.dev.js.map
