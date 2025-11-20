const Model_Pembayaran = require('./Model_Pembayaran');

class Model_DetailPembayaran {

  // Kembalikan "detail" berdasarkan id_reservasi
  // Format array 1 elemen, mirip hasil query dulu.
  static async getByReservasi(id_reservasi) {
    const rows = await Model_Pembayaran.getByReservasi(id_reservasi);
    if (!rows || rows.length === 0) return [];
    const p = rows[0];

    return [{
      id_detail: p.id_pembayaran,
      id_reservasi: p.id_reservasi,
      metode_pembayaran: p.metode_pembayaran,
      status_pembayaran: p.status_pembayaran,
      bukti_pembayaran: p.bukti_pembayaran,
      status_bukti: p.status_bukti,
      catatan_admin: p.catatan_admin,
      konfirmasi_admin: p.konfirmasi_admin,
      created_at: p.created_at,
      updated_at: p.updated_at
    }];
  }

  // create detail = insert pembayaran
  static async create(data) {
    const insert = {
      id_reservasi: data.id_reservasi,
      metode_pembayaran: data.metode_pembayaran || 'transaksi',
      status_pembayaran: data.status_pembayaran || 'unpaid',
      bukti_pembayaran: data.bukti_pembayaran || null,
      status_bukti: data.status_bukti || 'pending',
      catatan_admin: data.catatan_admin || null,
      konfirmasi_admin: data.konfirmasi_admin || false,
      created_at: new Date(),
      updated_at: new Date()
    };
    return Model_Pembayaran.Store(insert);
  }

  // updateByReservasi = update row pembayaran
  static async updateByReservasi(id_reservasi, data) {
    const rows = await Model_Pembayaran.getByReservasi(id_reservasi);
    const mapped = {};

    if (data.metode_pembayaran !== undefined) mapped.metode_pembayaran = data.metode_pembayaran;
    if (data.status_pembayaran !== undefined) mapped.status_pembayaran = data.status_pembayaran;
    if (data.bukti_pembayaran !== undefined) mapped.bukti_pembayaran = data.bukti_pembayaran;
    if (data.status_bukti !== undefined) mapped.status_bukti = data.status_bukti;
    if (data.catatan_admin !== undefined) mapped.catatan_admin = data.catatan_admin;
    if (data.konfirmasi_admin !== undefined) mapped.konfirmasi_admin = data.konfirmasi_admin;
    mapped.updated_at = new Date();

    if (!rows || rows.length === 0) {
      const insert = Object.assign({ id_reservasi, created_at: new Date() }, mapped);
      return Model_Pembayaran.Store(insert);
    } else {
      return Model_Pembayaran.Update(rows[0].id_pembayaran, mapped);
    }
  }

  // upsertBukti → pakai uploadBuktiByReservasi
  static async upsertBukti(id_reservasi, filename) {
    return Model_Pembayaran.uploadBuktiByReservasi(id_reservasi, filename);
  }
}

module.exports = Model_DetailPembayaran;
