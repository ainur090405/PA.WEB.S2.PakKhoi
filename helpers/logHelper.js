// helpers/logHelper.js
const Model_LogReservasi = require('../models/Model_LogReservasi');

async function createLog(id_reservasi, status_awal, status_akhir, keterangan) {
  try {
    await Model_LogReservasi.Store({     // <- gunakan Store (S besar)
      id_reservasi,
      status_awal,
      status_akhir,
      keterangan,
      created_at: new Date()
    });
  } catch (err) {
    console.error('Gagal membuat log reservasi:', err);
  }
}

module.exports = { createLog };
