const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin/dashboard', {
    title: 'Dashboard Admin',
  });
});

module.exports = router;