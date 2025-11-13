const express = require('express');
const router = express.Router();
const Model_Jadwal = require('../models/Model_Jadwal');
const Model_Arena = require('../models/Model_Arena'); 
const Model_Reservasi = require('../models/Model_Reservasi');// <-- Ini sudah benar, dibutuhkan
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Lindungi semua rute, hanya Admin
router.use(isAuthenticated, isAdmin);

// =============================================
// RUTE BARU: Menampilkan Halaman Generator
// (Ini adalah Langkah 3A)
// =============================================
router.get('/generator', async (req, res) => {
  try {
    const arenaList = await Model_Arena.getAll(); // Ambil daftar arena
    res.render('admin/jadwal/generator', {
      title: 'Generator Jadwal Massal',
      arenaList: arenaList // Kirim ke EJS untuk dropdown
    });
  } catch (err) {
    req.flash('error_msg', 'Gagal memuat data arena.');
    res.redirect('/jadwal');
  }
});

// =============================================
// RUTE BARU: Memproses Logika "Pabrik"
// (Ini adalah Langkah 3B)
// =============================================
router.post('/generator', async (req, res) => {
  try {
    const { id_arena, hari, jam_buka_operasi, jam_tutup_operasi, durasi_sesi, jumlah_minggu } = req.body;
    
    if (!hari) {
      req.flash('error_msg', 'Anda harus memilih minimal satu hari.');
      return res.redirect('/jadwal/generator');
    }

    const daftarSesiBaru = [];
    const hariInput = Array.isArray(hari) ? hari : [hari];
    const durasiMs = parseInt(durasi_sesi) * 60000; 
    const totalHari = parseInt(jumlah_minggu) * 7;
    const namaHariJS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let i = 0; i < totalHari; i++) {
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + i);
      const namaHariIni = namaHariJS[currentDate.getDay()]; 

      if (hariInput.includes(namaHariIni)) {
        
        const setTime = (date, timeStr) => {
          const [hours, minutes] = timeStr.split(':');
          const newDate = new Date(date.getTime()); 
          newDate.setHours(hours, minutes, 0, 0);
          return newDate;
        };
        
        let sesiMulai = setTime(currentDate, jam_buka_operasi);
        let jamTutupOperasi = setTime(currentDate, jam_tutup_operasi);

        while (sesiMulai < jamTutupOperasi) {
          let sesiSelesai = new Date(sesiMulai.getTime() + durasiMs);

          if (sesiSelesai > jamTutupOperasi) {
            break;
          }

          const dataSesi = {
            id_arena: id_arena,
            tanggal: sesiMulai.toISOString().slice(0, 10), 
            jam_mulai: sesiMulai.toTimeString().slice(0, 5), 
            jam_selesai: sesiSelesai.toTimeString().slice(0, 5), 
            status_slot: 'kosong'
          };
          
          daftarSesiBaru.push(dataSesi);
          sesiMulai = sesiSelesai;
        }
      }
    }
    
    if (daftarSesiBaru.length > 0) {
      await Model_Jadwal.StoreMany(daftarSesiBaru); // Memanggil fungsi dari Langkah 2
      req.flash('success_msg', `${daftarSesiBaru.length} slot jadwal baru berhasil di-generate!`);
    } else {
      req.flash('error_msg', 'Tidak ada jadwal yang di-generate. Cek kembali input Anda.');
    }
    
    res.redirect('/jadwal'); 

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Terjadi error saat generate jadwal: ' + err.message);
    res.redirect('/jadwal/generator');
  }
});


// =============================================
// RUTE-RUTE LAMA ANDA (CRUD MANUAL)
// (Ini adalah kode yang Anda kirim - TIDAK DIHAPUS)
// =============================================

// GET: Tampilkan daftar jadwal
router.get('/', async (req, res) => {
  try {
    const jadwal = await Model_Jadwal.getAll();
    res.render('admin/jadwal/index', {
      title: 'Manajemen Jadwal',
      data: jadwal
    });
  } catch (err) {
    req.flash('error_msg', 'Gagal memuat data jadwal.');
    res.redirect('/admin/dashboard');
  }
});

// GET: Form tambah jadwal
router.get('/create', async (req, res) => {
  try {
    const arenaList = await Model_Arena.getAll(); // Ambil daftar arena
    res.render('admin/jadwal/create', {
      title: 'Tambah Jadwal Baru',
      arenaList: arenaList // Kirim ke EJS
    });
  } catch (err) {
    req.flash('error_msg', 'Gagal memuat data arena.');
    res.redirect('/jadwal');
  }
});

// POST: Simpan jadwal baru
router.post('/store', async (req, res) => {
  try {
    const { id_arena, tanggal, jam_mulai, jam_selesai, status_slot } = req.body;
    const dataJadwal = { id_arena, tanggal, jam_mulai, jam_selesai, status_slot };
    
    await Model_Jadwal.Store(dataJadwal);
    req.flash('success_msg', 'Jadwal baru berhasil ditambahkan.');
    res.redirect('/jadwal');
  } catch (err) {
    req.flash('error_msg', 'Gagal menyimpan jadwal: ' + err.code);
    res.redirect('/jadwal/create');
  }
});

// GET: Form edit jadwal
router.get('/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [jadwalData, arenaList] = await Promise.all([
      Model_Jadwal.getById(id),
      Model_Arena.getAll()
    ]);
    
    if (jadwalData.length === 0) {
      req.flash('error_msg', 'Jadwal tidak ditemukan.');
      return res.redirect('/jadwal');
    }
    
    res.render('admin/jadwal/edit', {
      title: 'Edit Jadwal',
      jadwal: jadwalData[0], 
      arenaList: arenaList
    });
  } catch (err) {
    req.flash('error_msg', 'Gagal memuat data.');
    res.redirect('/jadwal');
  }
});

// POST: Update jadwal
router.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const { id_arena, tanggal, jam_mulai, jam_selesai, status_slot } = req.body;
    const dataJadwal = { id_arena, tanggal, jam_mulai, jam_selesai, status_slot };

    await Model_Jadwal.Update(id, dataJadwal);
    req.flash('success_msg', 'Data jadwal berhasil diperbarui.');
    res.redirect('/jadwal');
  } catch (err) {
    req.flash('error_msg', 'Gagal memperbarui jadwal: ' + err.code);
    res.redirect('/jadwal/edit/' + id);
  }
});

router.post('/update-status/:id', async (req, res) => {
  try {
    const id_reservasi = req.params.id;
    const { status } = req.body;
    const reservasiData = await Model_Reservasi.getById(id_reservasi);
    const reservasi = Array.isArray(reservasiData) ? reservasiData[0] : reservasiData;

    console.log('[DEBUG] Reservasi Ditemukan:', reservasi);

    if (!reservasi || !reservasi.id_jadwal) {
      console.log('[DEBUG] Reservasi kosong atau tidak punya id_jadwal.');
      req.flash('error_msg', 'Data reservasi tidak ditemukan atau tidak valid.');
      return res.redirect('/reservasi');
    }

    // Update status reservasi
    await Model_Reservasi.Update(id_reservasi, { status });
    console.log(`[DEBUG] Reservasi ${id_reservasi} → status ${status}`);

    // Sinkronisasi slot jadwal
    const id_jadwal = reservasi.id_jadwal;
    if (status === 'disetujui') {
      console.log(`[DEBUG] Jadwal ${id_jadwal} → terisi`);
      await Model_Jadwal.Update(id_jadwal, { status_slot: 'terisi' });

    } else if (status === 'ditolak' || status === 'batal') {
      console.log(`[DEBUG] Jadwal ${id_jadwal} → kosong`);
      await Model_Jadwal.Update(id_jadwal, { status_slot: 'kosong' });
    }

    req.flash('success_msg', `Status reservasi berhasil diperbarui menjadi ${status}`);
    res.redirect('/reservasi');

  } catch (err) {
    console.error('[DEBUG ERROR] Gagal update status:', err);
    req.flash('error_msg', 'Gagal memperbarui status reservasi');
    res.redirect('/reservasi');
  }
});

// GET: Hapus jadwal
router.get('/delete/:id', async (req, res) => {
  try {
    await Model_Jadwal.Delete(req.params.id);
    req.flash('success_msg', 'Data jadwal berhasil dihapus.');
    res.redirect('/jadwal');
  } catch (err) {
    req.flash('error_msg', 'Gagal menghapus jadwal: ' + err.code);
    res.redirect('/jadwal');
  }
});

module.exports = router;