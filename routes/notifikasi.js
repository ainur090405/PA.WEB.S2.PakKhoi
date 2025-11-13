const express = require('express');
const router = express.Router();
const Model_Notifikasi = require('../models/Model_Notifikasi');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET: Ambil notifikasi user (untuk AJAX)
router.get('/get', isAuthenticated, async (req, res) => {
  try {
    const id_user = req.session.user.id;
    const notifications = await Model_Notifikasi.getByUser(id_user);
    const unreadCount = await Model_Notifikasi.getUnreadCount(id_user);
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil notifikasi' });
  }
});

// POST: Tandai notifikasi sebagai dibaca
router.post('/mark-read/:id', isAuthenticated, async (req, res) => {
  try {
    const id_notifikasi = req.params.id;
    await Model_Notifikasi.markAsRead(id_notifikasi);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menandai notifikasi' });
  }
});

// POST: Tandai semua notifikasi sebagai dibaca
router.post('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    const id_user = req.session.user.id;
    await Model_Notifikasi.markAllAsRead(id_user);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menandai semua notifikasi' });
  }
});

module.exports = router;
