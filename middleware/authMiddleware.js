// Cek apakah user sudah login
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); 
  }
  req.flash('error_msg', 'Anda harus login untuk mengakses halaman ini.');
  res.redirect('/auth/login');
};

// Cek role Admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next(); // Lanjut jika rolenya 'admin'
  }
  req.flash('error_msg', 'Akses ditolak. Halaman ini khusus Admin.');
  res.redirect('/pemain/dashboard'); // Redirect pemain ke dashboardnya
};

// Cek role Pemain
const isPemain = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'pemain') {
    return next(); // Lanjut jika rolenya 'pemain'
  }
  req.flash('error_msg', 'Akses ditolak. Halaman ini khusus Pemain.');
  res.redirect('/admin/dashboard'); 
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isPemain
};