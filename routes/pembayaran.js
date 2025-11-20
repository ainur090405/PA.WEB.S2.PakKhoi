// routes/pembayaran.js
const express = require('express');
const router = express.Router();

const connection = require('../config/database');
const Model_Pembayaran = require('../models/Model_Pembayaran');
const Model_Reservasi  = require('../models/Model_Reservasi');
const Model_Jadwal     = require('../models/Model_Jadwal');
const Model_Notifikasi = require('../models/Model_Notifikasi');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// ⬇️ TAMBAHAN: helper untuk log_reservasi
const { createLog } = require('../helpers/logHelper');

// semua route di sini hanya boleh diakses admin
router.use(isAuthenticated, isAdmin);

// ===============================
// GET: daftar pembayaran pending
// ===============================
router.get('/', async (req, res) => {
  try {
    const pembayaran = await Model_Pembayaran.getPendingPayments();
    res.render('admin/pembayaran/index', {
      title: 'Konfirmasi Pembayaran',
      data: pembayaran
    });
  } catch (err) {
    console.error('ERR GET /admin/pembayaran:', err);
    req.flash('error_msg', 'Gagal memuat data pembayaran.');
    res.redirect('/admin/dashboard');
  }
});

// =======================================
// POST: KONFIRMASI PEMBAYARAN (BERHASIL)
// =======================================
router.post('/confirm/:id_pembayaran', (req, res) => {
  const id_pembayaran = req.params.id_pembayaran;
  const { catatan_admin } = req.body || {};

  // 1) ambil dulu pembayaran-nya
  connection.query(
    'SELECT * FROM pembayaran WHERE id_pembayaran = ?',
    [id_pembayaran],
    async (err, rowsBayar) => {
      if (err) {
        console.error('ERR SELECT pembayaran:', err);
        req.flash('error_msg', 'Gagal mengambil data pembayaran.');
        return res.redirect('/admin/pembayaran');
      }

      if (!rowsBayar || rowsBayar.length === 0) {
        req.flash('error_msg', 'Data pembayaran tidak ditemukan.');
        return res.redirect('/admin/pembayaran');
      }

      const bayar = rowsBayar[0];
      const id_reservasi = bayar.id_reservasi;

      // 2) update tabel pembayaran -> confirmed
      connection.query(
        `UPDATE pembayaran
         SET status_pembayaran = 'confirmed',
             konfirmasi_admin = 1,
             catatan_admin = ?,
             updated_at = NOW()
         WHERE id_pembayaran = ?`,
        [catatan_admin || null, id_pembayaran],
        async (err2) => {
          if (err2) {
            console.error('ERR UPDATE pembayaran:', err2);
            req.flash('error_msg', 'Gagal mengkonfirmasi pembayaran.');
            return res.redirect('/admin/pembayaran');
          }

          try {
            // 🔎 ambil data reservasi sebelum di-update untuk log status_awal
            const rowsReservasiBefore = await Model_Reservasi.getById(id_reservasi);
            const reservasiBefore = rowsReservasiBefore && rowsReservasiBefore[0] ? rowsReservasiBefore[0] : null;
            const statusAwal = reservasiBefore ? (reservasiBefore.status || null) : null;

            // 3) update reservasi -> disetujui
            await Model_Reservasi.Update(id_reservasi, { status: 'disetujui' });

            // 🔎 ambil lagi sesudah update (untuk keperluan jadwal & log kalau mau cek)
            const rowsReservasi = await Model_Reservasi.getById(id_reservasi);
            const reservasi = rowsReservasi && rowsReservasi[0] ? rowsReservasi[0] : null;

            // 3b) SIMPAN LOG RESERVASI
            try {
              await createLog(
                id_reservasi,
                statusAwal || 'menunggu',
                'disetujui',
                'Pembayaran dikonfirmasi admin'
              );
            } catch (logErr) {
              console.warn('Gagal membuat log konfirmasi pembayaran:', logErr);
            }

            // 4) update jadwal -> terisi
            if (reservasi && reservasi.id_jadwal) {
              await Model_Jadwal.Update(reservasi.id_jadwal, { status_slot: 'terisi' });
            }

            // 5) kirim notifikasi ke pemain (kalau ada)
            try {
              if (reservasi && reservasi.id_user) {
                await Model_Notifikasi.Store({
                  id_user: reservasi.id_user,
                  judul: 'Pembayaran Dikonfirmasi',
                  isi_pesan: `Pembayaran Anda untuk arena ${reservasi.nama_arena || 'Arena'} telah dikonfirmasi. Booking Anda sekarang aktif.`,
                  jenis_notif: 'status',
                  tipe: 'payment',
                  dibaca: 0
                });
              }
            } catch (notifErr) {
              console.warn('Gagal kirim notif konfirmasi pembayaran:', notifErr);
            }

            req.flash('success_msg', 'Pembayaran berhasil dikonfirmasi.');
            return res.redirect('/admin/pembayaran');
          } catch (e) {
            console.error('ERR AFTER UPDATE pembayaran:', e);
            req.flash('error_msg', 'Pembayaran terupdate, tapi terjadi error lanjutan. Cek log server.');
            return res.redirect('/admin/pembayaran');
          }
        }
      );
    }
  );
});

// ==================================
// POST: TOLAK PEMBAYARAN (REJECTED)
// ==================================
router.post('/reject/:id_pembayaran', (req, res) => {
  const id_pembayaran = req.params.id_pembayaran;
  const { catatan_admin } = req.body || {};

  // 1) ambil dulu pembayaran
  connection.query(
    'SELECT * FROM pembayaran WHERE id_pembayaran = ?',
    [id_pembayaran],
    async (err, rowsBayar) => {
      if (err) {
        console.error('ERR SELECT pembayaran (reject):', err);
        req.flash('error_msg', 'Gagal mengambil data pembayaran.');
        return res.redirect('/admin/pembayaran');
      }

      if (!rowsBayar || rowsBayar.length === 0) {
        req.flash('error_msg', 'Data pembayaran tidak ditemukan.');
        return res.redirect('/admin/pembayaran');
      }

      const bayar = rowsBayar[0];
      const id_reservasi = bayar.id_reservasi;

      // 2) update pembayaran -> rejected
      connection.query(
        `UPDATE pembayaran
         SET status_pembayaran = 'rejected',
             konfirmasi_admin = 1,
             catatan_admin = ?,
             updated_at = NOW()
         WHERE id_pembayaran = ?`,
        [catatan_admin || null, id_pembayaran],
        async (err2) => {
          if (err2) {
            console.error('ERR UPDATE pembayaran (reject):', err2);
            req.flash('error_msg', 'Gagal menolak pembayaran.');
            return res.redirect('/admin/pembayaran');
          }

          try {
            // 🔎 ambil status reservasi sebelum diubah
            const rowsReservasiBefore = await Model_Reservasi.getById(id_reservasi);
            const reservasiBefore = rowsReservasiBefore && rowsReservasiBefore[0] ? rowsReservasiBefore[0] : null;
            const statusAwal = reservasiBefore ? (reservasiBefore.status || null) : null;

            // 3) update reservasi -> ditolak + kosongkan slot
            if (typeof Model_Reservasi.rejectAndFreeSlot === 'function') {
              await Model_Reservasi.rejectAndFreeSlot(id_reservasi);
            } else {
              await Model_Reservasi.Update(id_reservasi, { status: 'ditolak' });
              const rowsReservasi = await Model_Reservasi.getById(id_reservasi);
              if (rowsReservasi && rowsReservasi[0] && rowsReservasi[0].id_jadwal) {
                await Model_Jadwal.Update(rowsReservasi[0].id_jadwal, { status_slot: 'kosong' });
              }
            }

            // 3b) SIMPAN LOG RESERVASI (ditolak)
            try {
              await createLog(
                id_reservasi,
                statusAwal || 'menunggu',
                'ditolak',
                `Pembayaran ditolak admin. ${catatan_admin || ''}`
              );
            } catch (logErr) {
              console.warn('Gagal membuat log tolak pembayaran:', logErr);
            }

            // 4) kirim notifikasi ke pemain
            try {
              const rowsReservasi = await Model_Reservasi.getById(id_reservasi);
              const r = rowsReservasi && rowsReservasi[0] ? rowsReservasi[0] : null;
              if (r && r.id_user) {
                await Model_Notifikasi.Store({
                  id_user: r.id_user,
                  judul: 'Pembayaran Ditolak',
                  isi_pesan: `Pembayaran Anda untuk arena ${r.nama_arena || 'Arena'} ditolak. ${catatan_admin || ''}`,
                  jenis_notif: 'status',
                  tipe: 'payment',
                  dibaca: 0
                });
              }
            } catch (notifErr) {
              console.warn('Gagal kirim notif tolak pembayaran:', notifErr);
            }

            req.flash('success_msg', 'Pembayaran berhasil ditolak.');
            return res.redirect('/admin/pembayaran');
          } catch (e) {
            console.error('ERR AFTER UPDATE pembayaran (reject):', e);
            req.flash('error_msg', 'Pembayaran terupdate, tapi terjadi error lanjutan. Cek log server.');
            return res.redirect('/admin/pembayaran');
          }
        }
      );
    }
  );
});

module.exports = router;
