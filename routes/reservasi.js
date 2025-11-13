// routes/reservasi.js
const express = require('express');
const router = express.Router();
const Model_Reservasi = require('../models/Model_Reservasi');
const Model_Pembayaran = require('../models/Model_Pembayaran');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Lindungi semua rute, hanya Admin
router.use(isAuthenticated, isAdmin);

// GET: Tampilkan daftar reservasi
router.get('/', async (req, res) => {
  try {
    const reservasi = await Model_Reservasi.getAll();
    res.render('admin/reservasi/index', {
      title: 'Manajemen Reservasi',
      data: reservasi
    });
  } catch (err) {
    console.error(err); // Tampilkan error di console
    req.flash('error_msg', 'Gagal memuat data reservasi.');
    res.redirect('/admin/dashboard');
  }
});

// GET: Form edit reservasi (untuk ubah status)
router.get('/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const reservasiData = await Model_Reservasi.getById(id);

    if (reservasiData.length === 0) {
      req.flash('error_msg', 'Reservasi tidak ditemukan.');
      return res.redirect('/reservasi');
    }

    res.render('admin/reservasi/edit', {
      title: 'Update Status Reservasi',
      reservasi: reservasiData[0]
    });
  } catch (err) {
    req.flash('error_msg', 'Gagal memuat data reservasi.');
    res.redirect('/reservasi');
  }
});

router.post('/update-status/:id', async (req, res) => {
  try {
    const id_reservasi = req.params.id;
    const { status } = req.body;

    if (status === 'ditolak') {
      // ✅ Gunakan fungsi otomatis tolak + kosongkan slot
      await Model_Reservasi.rejectAndFreeSlot(id_reservasi);
    } else {
      // Untuk status lain (disetujui, menunggu, dsb)
      await Model_Reservasi.Update(id_reservasi, { status });

      // Sinkronkan status slot manual
      const reservasi = await Model_Reservasi.getById(id_reservasi);
      const id_jadwal = reservasi[0].id_jadwal;

      if (status === 'disetujui') {
        await Model_Jadwal.Update(id_jadwal, { status_slot: 'terisi' });
      } else if (status === 'batal') {
        await Model_Jadwal.Update(id_jadwal, { status_slot: 'kosong' });
      }
    }

    req.flash('success_msg', `Status reservasi berhasil diperbarui menjadi ${status}`);
    res.redirect('/reservasi');

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memperbarui status reservasi');
    res.redirect('/reservasi');
  }
});


// POST: Update reservasi
router.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const { status, catatan } = req.body;
    const dataToUpdate = { status, catatan };

    const reservasiData = await Model_Reservasi.getById(id);
    if (reservasiData.length === 0) {
      req.flash('error_msg', 'Reservasi tidak ditemukan.');
      return res.redirect('/admin/reservasi');
    }

    const id_jadwal = reservasiData[0].id_jadwal;
    const Model_Jadwal = require('../models/Model_Jadwal');
    const Model_Notifikasi = require('../models/Model_Notifikasi');

    // 🔹 Update status reservasi
    await Model_Reservasi.Update(id, dataToUpdate);

    // 🔹 Sinkronisasi status jadwal
    if (status === 'disetujui') {
      await Model_Jadwal.Update(id_jadwal, { status_slot: 'terisi' });
    } 
    else if (status === 'ditolak' || status === 'batal') {
      // kalau ditolak atau dibatalkan, buka lagi slotnya
      await Model_Jadwal.Update(id_jadwal, { status_slot: 'kosong' });
    } 
    else if (status === 'selesai') {
      // biarkan tetap terisi, karena sudah main
      await Model_Jadwal.Update(id_jadwal, { status_slot: 'terisi' });
    }

    // 🔹 Kirim notifikasi ke pemain
    if (reservasiData[0].id_user) {
      const notif = {
        id_user: reservasiData[0].id_user,
        judul: `Status Booking: ${status.toUpperCase()}`,
        isi_pesan:
          status === 'disetujui' ? 
            `Booking Anda untuk arena ${reservasiData[0].nama_arena} telah disetujui.` :
          status === 'ditolak' ?
            `Maaf, booking Anda untuk arena ${reservasiData[0].nama_arena} ditolak.` :
          status === 'selesai' ?
            `Terima kasih telah bermain di ${reservasiData[0].nama_arena}.` :
            `Status booking Anda telah berubah menjadi ${status}.`,
        jenis_notif: 'status',
        tipe: 'booking',
        dibaca: 0
      };
      await Model_Notifikasi.Store(notif);
    }

    req.flash('success_msg', 'Status reservasi berhasil diperbarui.');
    res.redirect('/admin/reservasi');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal memperbarui reservasi: ' + err.message);
    res.redirect('/admin/reservasi/edit/' + id);
  }
});


// GET: Hapus reservasi
router.get('/delete/:id', async (req, res) => {
  try {
    await Model_Reservasi.Delete(req.params.id);
    req.flash('success_msg', 'Data reservasi berhasil dihapus.');
    res.redirect('/reservasi');
  } catch (err) {
    req.flash('error_msg', 'Gagal menghapus reservasi: ' + err.code);
    res.redirect('/reservasi');
  }
});

// GET: Download reservasi data as CSV
router.get('/download', async (req, res) => {
  try {
    const reservasi = await Model_Reservasi.getAll();
    let csv = 'ID,Pemesan,Arena,Tanggal Main,Jam,Tanggal Pesan,Status,Pembayaran,Jumlah\n';

    reservasi.forEach(r => {
      csv += `${r.id_reservasi},${r.nama_user},${r.nama_arena},${new Date(r.tanggal).toLocaleDateString('id-ID')},${r.jam_mulai.substring(0,5)},${new Date(r.tanggal_pesan).toLocaleDateString('id-ID')},${r.status},${r.payment_method || ''},${r.amount || 0}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('reservasi.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Gagal mendownload data reservasi.');
    res.redirect('/reservasi');
  }
});

module.exports = router;
