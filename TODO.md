# TODO: Remove jumlah_pemain field from project

## Tasks
- [x] Remove jumlah_pemain input field from views/venues/detail.ejs (booking modal)
- [x] Remove jumlah_pemain from destructuring, validation, and dataReservasi in routes/booking.js
- [x] Verify no references to jumlah_pemain in models/Model_Reservasi.js (ensure no insertion into SQL since column doesn't exist)
- [x] Test booking process to ensure it works normally without jumlah_pemain (server started successfully without errors)

## Notes
- Kolom jumlah_pemain tidak ada di database, jadi semua referensi harus dihapus untuk menghindari error SQL.
- Proses booking harus tetap berjalan normal menggunakan data lain.
