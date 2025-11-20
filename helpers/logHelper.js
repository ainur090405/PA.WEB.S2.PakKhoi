const Model_LogReservasi = require('../models/Model_LogReservasi');

async function createLog(id_reservasi, status_awal, status_baru, keterangan = '') {
  try {
    await Model_LogReservasi.store({
      id_reservasi,
      waktu_perubahan: new Date(),
      status_awal,
      status_baru,
      keterangan
    });
  } catch (err) {
    console.error('Gagal membuat log reservasi:', err);
  }
}

module.exports = { createLog };
