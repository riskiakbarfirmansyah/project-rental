const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const configs = [
  { key: 'about_val1_title', value: 'Keamanan' },
  { key: 'about_val1_desc', value: 'Armada berstandar keamanan tinggi' },
  { key: 'about_val2_title', value: 'Kualitas' },
  { key: 'about_val2_desc', value: 'Perawatan rutin setiap bulan' },
  { key: 'about_val3_title', value: 'Premium' },
  { key: 'about_val3_desc', value: 'Pengalaman berkendara mewah' },
  { key: 'about_val4_title', value: 'Kepercayaan' },
  { key: 'about_val4_desc', value: '5000+ pelanggan puas' },
  { key: 'about_srv1_title', value: 'Pilihan Waktu Sewa' },
  { key: 'about_srv1_desc', value: 'Harian / Mingguan / Bulanan / Tahunan' },
  { key: 'about_srv2_title', value: 'Opsi Pengemudi' },
  { key: 'about_srv2_desc', value: 'Dengan Driver / Non-Driver (Lepas Kunci)' },
  { key: 'about_srv3_title', value: 'Paket Lengkap All In' },
  { key: 'about_srv3_desc', value: 'Sudah Termasuk Unit Mobil, Driver & Bahan Bakar (BBM)' },
  { key: 'about_srv4_title', value: 'Kategori Perjalanan' },
  { key: 'about_srv4_desc', value: 'Perseorangan / Perusahaan / Instansi / Dinas / Perjalanan Bisnis' },
  { key: 'about_srv5_title', value: 'Kesiapan Layanan' },
  { key: 'about_srv5_desc', value: 'Layanan Operasional Siap 24 Jam per 7 Hari Seminggu' },
  { key: 'about_srv6_title', value: 'Layanan Transportasi Hub' },
  { key: 'about_srv6_desc', value: 'Antar-Jemput Bandara, Stasiun Kereta Api, dan Pelabuhan' },
  { key: 'about_grt1_title', value: 'Perawatan Bengkel Resmi' },
  { key: 'about_grt1_desc', value: 'Setiap unit armada diservis secara berkala hanya di bengkel dealer resmi untuk memastikan performa mesin dan fitur keselamatan berkendara selalu dalam kondisi 100% prima.' },
  { key: 'about_grt2_title', value: 'Kabin Steril & Harum' },
  { key: 'about_grt2_desc', value: 'Jaminan kebersihan maksimal. Kabin mobil disemprot disinfektan sebelum diserahkan, bebas dari bekas asap rokok, harum segar mewah, dan bersih layaknya mobil baru.' },
  { key: 'about_grt3_title', value: 'Layanan Darurat 24 Jam' },
  { key: 'about_grt3_desc', value: 'Bantuan darurat di jalan raya (roadside assistance) siaga 24/7 beserta jaminan penggantian unit cadangan instan jika terjadi kendala teknis tak terduga selama masa sewa.' },
  { key: 'booking_promo_title', value: 'Promo & Potongan Harga Khusus' },
  { key: 'booking_promo_desc', value: 'Dapatkan harga spesial (lebih hemat dari estimasi) untuk kondisi berikut: * Penyewaan lebih dari 7 hari * Penyewa yang sedang berulang tahun * Klaim diskon ke admin via WhatsApp setelah pesanan dikirim!' }
];

async function main() {
  for (let c of configs) {
    await prisma.siteConfig.upsert({
      where: { key: c.key },
      update: {},
      create: c
    });
  }
  console.log('Seed config done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
