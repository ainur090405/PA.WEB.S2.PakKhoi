// routes/reservasi.js
const express = require('express');
const router = express.Router();

const Model_Reservasi = require('../models/Model_Reservasi');
const Model_Jadwal = require('../models/Model_Jadwal');
const Model_Notifikasi = require('../models/Model_Notifikasi');
const Model_LogReservasi = require('../models/Model_LogReservasi'); 
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Semua route di sini khusus admin
router.use(isAuthenticated, isAdmin);

// ============================
// LIST RESERVASI (ADMIN)
// ============================
router.get('/', async (req, res) => {
  try {
    const reservasi = await Model_Reservasi.getAll();
    res.render('admin/reservasi/index', {
      title: 'Manajemen Reservasi',
      data: reservasi
    });
  } catch (err) {
    console.error('ERR GET /admin/reservasi:', err);
    req.flash('error_msg', 'Gagal memuat data reservasi.');
    return res.redirect('/admin/dashboard');
  }
});

// GET: form edit reservasi
router.get('/edit/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const rows = await Model_Reservasi.getById(id);
    if (!rows || rows.length === 0) {
      req.flash('error_msg', 'Data reservasi tidak ditemukan.');
      return res.redirect('/admin/reservasi');
    }

    const reservasi = rows[0];

    // ⬇️ AMBIL RIWAYAT LOG UNTUK RESERVASI INI
    let logs = [];
    try {
      logs = await Model_LogReservasi.getByReservasi(id);
    } catch (logErr) {
      console.warn('Gagal mengambil log reservasi:', logErr);
    }

    res.render('admin/reservasi/edit', {
      title: 'Update Status Reservasi',
      reservasi,
      logs   // dikirim ke view (kalau mau dipakai)
    });
  } catch (err) {
    console.error('ERR GET /admin/reservasi/edit:', err);
    req.flash('error_msg', 'Gagal memuat data reservasi.');
    res.redirect('/admin/reservasi');
  }
});

// ============================
// UPDATE STATUS (SINGLE FIELD)
// ============================
router.post('/update-status/:id', async (req, res) => {
  try {
    const id_reservasi = req.params.id;
    const { status } = req.body;

    // ⬇️ AMBIL STATUS AWAL UNTUK LOG
    const rowsBefore = await Model_Reservasi.getById(id_reservasi);
    if (!rowsBefore || rowsBefore.length === 0) {
      req.flash('error_msg', 'Reservasi tidak ditemukan.');
      return res.redirect('/admin/reservasi');
    }
    const reservasiBefore = rowsBefore[0];
    const status_awal = reservasiBefore.status;

    // =======================
    // LOGIKA LAMA (TIDAK DIUBAH)
    // =======================
    if (status === 'ditolak') {
      if (typeof Model_Reservasi.rejectAndFreeSlot === 'function') {
        await Model_Reservasi.rejectAndFreeSlot(id_reservasi);
      } else {
        await Model_Reservasi.Update(id_reservasi, { status: 'ditolak' });
        const r = await Model_Reservasi.getById(id_reservasi);
        if (r && r[0] && r[0].id_jadwal) {
          await Model_Jadwal.Update(r[0].id_jadwal, { status_slot: 'kosong' });
        }
      }
    } else {
      // Status lain: cukup update status reservasi + sinkron jadwal
      await Model_Reservasi.Update(id_reservasi, { status });

      const rows = await Model_Reservasi.getById(id_reservasi);
      if (rows && rows[0]) {
        const id_jadwal = rows[0].id_jadwal;
        if (id_jadwal) {
          if (status === 'disetujui') {
            await Model_Jadwal.Update(id_jadwal, { status_slot: 'terisi' });
          } else if (status === 'batal' || status === 'ditolak') {
            await Model_Jadwal.Update(id_jadwal, { status_slot: 'kosong' });
          } else if (status === 'selesai') {
            await Model_Jadwal.Update(id_jadwal, { status_slot: 'terisi' });
          }
        }
      }
    }

    // ⬇️ CATAT LOG PERUBAHAN STATUS
    try {
      await Model_LogReservasi.catatStatus(
        id_reservasi,
        status_awal,
        status,
        'Update via tombol cepat /update-status'
      );
    } catch (logErr) {
      console.warn('Gagal mencatat log reservasi (update-status):', logErr);
    }

    // ⬇️ KIRIM NOTIFIKASI KE USER (DIPERKAYA DENGAN TANGGAL/JAM/METODE)
    try {
      const rows = await Model_Reservasi.getById(id_reservasi);
      if (rows && rows[0] && rows[0].id_user) {
        const r = rows[0];

        const tanggalMain = r.tanggal
          ? new Date(r.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          : '-';

        const jamMulai   = r.jam_mulai   ? r.jam_mulai.substring(0, 5)   : '-';
        const jamSelesai = r.jam_selesai ? r.jam_selesai.substring(0, 5) : '-';

        let metodeText = '';
        if (r.pembayaran_metode === 'cod') {
          metodeText = ' dengan metode COD (bayar di tempat)';
        } else if (r.pembayaran_metode === 'transaksi') {
          metodeText = ' dengan metode Transfer Bank';
        } else {
          metodeText = '';
        }

        let isi_pesan;
        if (status === 'disetujui') {
          isi_pesan =
            `Booking Anda untuk arena ${r.nama_arena} pada ${tanggalMain} ` +
            `pukul ${jamMulai}–${jamSelesai}${metodeText} telah disetujui.`;
        } else if (status === 'ditolak') {
          isi_pesan =
            `Maaf, booking Anda untuk arena ${r.nama_arena} pada ${tanggalMain} ` +
            `pukul ${jamMulai}–${jamSelesai}${metodeText} ditolak. ` +
            `Silakan hubungi admin untuk informasi lebih lanjut.`;
        } else if (status === 'selesai') {
          isi_pesan =
            `Terima kasih telah bermain di ${r.nama_arena} pada ${tanggalMain} ` +
            `pukul ${jamMulai}–${jamSelesai}.`;
        } else {
          isi_pesan =
            `Status booking Anda untuk arena ${r.nama_arena} pada ${tanggalMain} ` +
            `pukul ${jamMulai}–${jamSelesai}${metodeText} telah berubah menjadi ${status}.`;
        }

        const notif = {
          id_user: r.id_user,
          judul: `Status Booking: ${status.toUpperCase()}`,
          isi_pesan,
          jenis_notif: 'status',
          tipe: 'booking',
          dibaca: 0
        };

        if (typeof Model_Notifikasi.Store === 'function') {
          await Model_Notifikasi.Store(notif);
        }
      }
    } catch (notifErr) {
      console.warn('Gagal kirim notifikasi (non blocking):', notifErr);
    }

    req.flash('success_msg', `Status reservasi berhasil diperbarui menjadi ${status}.`);
    return res.redirect('/admin/reservasi');

  } catch (err) {
    console.error('ERR POST /admin/reservasi/update-status:', err);
    req.flash('error_msg', 'Gagal memperbarui status reservasi.');
    return res.redirect('/admin/reservasi');
  }
});

// ============================
// UPDATE FORM LENGKAP (STATUS + CATATAN)
// ============================
router.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const { status, catatan } = req.body;
    const dataToUpdate = { status, catatan };

    // ⬇️ AMBIL DATA & STATUS AWAL UNTUK LOG
    const rows = await Model_Reservasi.getById(id);
    if (!rows || rows.length === 0) {
      req.flash('error_msg', 'Reservasi tidak ditemukan.');
      return res.redirect('/admin/reservasi');
    }
    const r = rows[0];
    const status_awal = r.status;
    const id_jadwal = r.id_jadwal;

    // Update status & catatan (LOGIKA LAMA)
    await Model_Reservasi.Update(id, dataToUpdate);

    // Sinkron jadwal (LOGIKA LAMA)
    if (id_jadwal) {
      if (status === 'disetujui') {
        await Model_Jadwal.Update(id_jadwal, { status_slot: 'terisi' });
      } else if (status === 'ditolak' || status === 'batal') {
        await Model_Jadwal.Update(id_jadwal, { status_slot: 'kosong' });
      } else if (status === 'selesai') {
        await Model_Jadwal.Update(id_jadwal, { status_slot: 'terisi' });
      }
    }

    // ⬇️ CATAT LOG PERUBAHAN STATUS + CATATAN
    try {
      await Model_LogReservasi.catatStatus(
        id,
        status_awal,
        status,
        catatan || null
      );
    } catch (logErr) {
      console.warn('Gagal mencatat log reservasi (update form):', logErr);
    }

    // ⬇️ NOTIFIKASI DIPERKAYA (UNTUK COD JUGA)
    if (r.id_user) {
      const tanggalMain = r.tanggal
        ? new Date(r.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : '-';

      const jamMulai   = r.jam_mulai   ? r.jam_mulai.substring(0, 5)   : '-';
      const jamSelesai = r.jam_selesai ? r.jam_selesai.substring(0, 5) : '-';

      let metodeText = '';
      if (r.pembayaran_metode === 'cod') {
        metodeText = ' dengan metode COD (bayar di tempat)';
      } else if (r.pembayaran_metode === 'transaksi') {
        metodeText = ' dengan metode Transfer Bank';
      }

      let isi_pesan;
      if (status === 'disetujui') {
        isi_pesan =
          `Booking Anda untuk arena ${r.nama_arena} pada ${tanggalMain} ` +
          `pukul ${jamMulai}–${jamSelesai}${metodeText} telah disetujui.`;
      } else if (status === 'ditolak') {
        isi_pesan =
          `Maaf, booking Anda untuk arena ${r.nama_arena} pada ${tanggalMain} ` +
          `pukul ${jamMulai}–${jamSelesai}${metodeText} ditolak.` +
          (catatan ? ` Alasan: ${catatan}` : '');
      } else if (status === 'selesai') {
        isi_pesan =
          `Terima kasih telah bermain di ${r.nama_arena} pada ${tanggalMain} ` +
          `pukul ${jamMulai}–${jamSelesai}.`;
      } else {
        isi_pesan =
          `Status booking Anda untuk arena ${r.nama_arena} pada ${tanggalMain} ` +
          `pukul ${jamMulai}–${jamSelesai}${metodeText} telah berubah menjadi ${status}.`;
      }

      const notif = {
        id_user: r.id_user,
        judul: `Status Booking: ${status.toUpperCase()}`,
        isi_pesan,
        jenis_notif: 'status',
        tipe: 'booking',
        dibaca: 0
      };

      if (typeof Model_Notifikasi.Store === 'function') {
        await Model_Notifikasi.Store(notif);
      }
    }

    req.flash('success_msg', 'Status reservasi berhasil diperbarui.');
    return res.redirect('/admin/reservasi');
  } catch (err) {
    console.error('ERR POST /admin/reservasi/update:', err);
    req.flash('error_msg', 'Gagal memperbarui reservasi: ' + err.message);
    return res.redirect('/admin/reservasi/edit/' + id);
  }
});

// ============================
// DELETE RESERVASI
// ============================
router.get('/delete/:id', async (req, res) => {
  try {
    await Model_Reservasi.Delete(req.params.id);
    req.flash('success_msg', 'Data reservasi berhasil dihapus.');
    return res.redirect('/admin/reservasi');
  } catch (err) {
    console.error('ERR GET /admin/reservasi/delete:', err);
    req.flash('error_msg', 'Gagal menghapus reservasi: ' + (err.message || err.code));
    return res.redirect('/admin/reservasi');
  }
});

// ============================
// DOWNLOAD CSV
// ============================
router.get('/download', async (req, res) => {
  try {
    const reservasi = await Model_Reservasi.getAll();
    let csv = 'ID,Pemesan,Arena,Tanggal Main,Jam,Tanggal Pesan,Status,Metode Pembayaran,Status Pembayaran,Jumlah,Bukti\n';

    reservasi.forEach(r => {
      const tanggalMain = r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '';
      const jam = r.jam_mulai ? r.jam_mulai.substring(0, 5) : '';
      const tanggalPesan = r.tanggal_pesan ? new Date(r.tanggal_pesan).toLocaleDateString('id-ID') : '';

      const metode = r.metode_pembayaran || '';          // dari join pembayaran
      const statusPemb = r.status_pembayaran || '';
      const jumlah = r.jumlah || 0;                       // alias di model
      const bukti = r.pembayaran_bukti || '';

      csv += `${r.id_reservasi},"${(r.nama_user || '').replace(/"/g,'""')}","${(r.nama_arena || '').replace(/"/g,'""')}",${tanggalMain},${jam},${tanggalPesan},${r.status || ''},${metode},${statusPemb},${jumlah},${bukti}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('reservasi.csv');
    return res.send(csv);
  } catch (err) {
    console.error('ERR GET /admin/reservasi/download:', err);
    req.flash('error_msg', 'Gagal mendownload data reservasi.');
    return res.redirect('/admin/reservasi');
  }
});

module.exports = router;
