import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";


async function main() {
  console.log("🌱 Memulai seeding database...");

  // Hapus data lama
  await prisma.contactMessage.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.user.deleteMany();

  // Buat admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@rentalku.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "081234567890",
    },
  });
  console.log("✅ Admin dibuat:", admin.email);

  // Buat customer contoh
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "082345678901",
    },
  });
  console.log("✅ Customer dibuat:", customer.email);

  // Buat mobil
  const carSeeds = [
    {
      name: "Agya",
      brand: "Toyota",
      year: 2024,
      pricePerDay: 275000,
      seats: 5,
      transmission: "AUTOMATIC" as const,
      fuel: "BENSIN" as const,
      description: "Toyota Agya, city car compact yang irit dan praktis untuk kebutuhan perjalanan dalam kota.",
      imageUrl: "/uploads/cars/agya.png",
      isAvailable: true,
    },
    {
      name: "Brio",
      brand: "Honda",
      year: 2024,
      pricePerDay: 300000,
      seats: 5,
      transmission: "AUTOMATIC" as const,
      fuel: "BENSIN" as const,
      description: "Honda Brio, city car compact yang nyaman, lincah, dan cocok untuk perjalanan harian.",
      imageUrl: "/uploads/cars/brio-rs.png",
      isAvailable: true,
    },
    {
      name: "All New Brio CVT 2025",
      brand: "Honda",
      year: 2025,
      pricePerDay: 300000,
      seats: 5,
      transmission: "AUTOMATIC" as const,
      fuel: "BENSIN" as const,
      description: "Honda All New Brio CVT 2025, city car modern dengan transmisi CVT yang nyaman untuk penggunaan harian.",
      imageUrl: "/uploads/cars/brio-rs.png",
      isAvailable: true,
    },
    {
      name: "All New Avanza CVT 2025",
      brand: "Toyota",
      year: 2025,
      pricePerDay: 350000,
      seats: 7,
      transmission: "AUTOMATIC" as const,
      fuel: "BENSIN" as const,
      description: "Toyota All New Avanza CVT 2025, MPV keluarga dengan kabin lega dan nyaman untuk perjalanan bersama.",
      imageUrl: "/uploads/cars/all-new-avanza.png",
      isAvailable: true,
    },
    {
      name: "Veloz Hybrid",
      brand: "Toyota",
      year: 2025,
      pricePerDay: 425000,
      seats: 7,
      transmission: "AUTOMATIC" as const,
      fuel: "HYBRID" as const,
      description: "Toyota Veloz Hybrid, MPV modern dengan tampilan premium dan efisiensi bahan bakar yang baik.",
      imageUrl: "/uploads/cars/veloz-hybrid.png",
      isAvailable: true,
    },
    {
      name: "Innova Reborn",
      brand: "Toyota",
      year: 2024,
      pricePerDay: 500000,
      seats: 7,
      transmission: "AUTOMATIC" as const,
      fuel: "DIESEL" as const,
      description: "Toyota Innova Reborn, MPV nyaman dan bertenaga untuk perjalanan keluarga maupun perjalanan luar kota.",
      imageUrl: "/uploads/cars/innova-reborn.png",
      isAvailable: true,
    },
    {
      name: "Zenix HEV",
      brand: "Toyota",
      year: 2025,
      pricePerDay: 625000,
      seats: 7,
      transmission: "AUTOMATIC" as const,
      fuel: "HYBRID" as const,
      description: "Toyota Zenix HEV, MPV hybrid dengan kenyamanan premium dan efisiensi untuk perjalanan keluarga maupun bisnis.",
      imageUrl: "/uploads/cars/zenix-hev.png",
      isAvailable: true,
    },
    {
      name: "Hiace",
      brand: "Toyota",
      year: 2024,
      pricePerDay: 1300000,
      seats: 14,
      transmission: "MANUAL" as const,
      fuel: "DIESEL" as const,
      description: "Toyota Hiace, minibus berkapasitas besar untuk rombongan, perjalanan wisata, dan kebutuhan corporate.",
      imageUrl: "/uploads/cars/hiace.png",
      isAvailable: true,
    },
  ];

  const cars = await Promise.all(
    carSeeds.map((car) =>
      prisma.car.create({
        data: car,
      })
    )
  );

  console.log(`✅ ${cars.length} mobil dibuat`);

  // Buat blog post
  const posts = await Promise.all([
    prisma.blogPost.create({
      data: {
        title: "Tips Menyewa Mobil untuk Pertama Kali",
        slug: "tips-menyewa-mobil-pertama-kali",
        excerpt: "Panduan lengkap bagi Anda yang pertama kali ingin menyewa mobil. Dari dokumen yang diperlukan hingga hal yang perlu diperhatikan.",
        content: `# Tips Menyewa Mobil untuk Pertama Kali\n\nMenyewa mobil bisa menjadi pilihan yang tepat ketika Anda membutuhkan kendaraan untuk perjalanan bisnis atau liburan.\n\n## Dokumen yang Diperlukan\n\n1. **KTP** - Kartu Tanda Penduduk yang masih berlaku\n2. **SIM A** - Surat Izin Mengemudi yang sesuai\n3. **Kartu Keluarga** (untuk beberapa penyewa)\n\n## Tips Penting\n\n- Periksa kondisi mobil sebelum menerima kunci\n- Dokumentasikan kerusakan yang sudah ada\n- Pahami ketentuan bahan bakar\n- Simpan nomor darurat rental\n\n## Kesimpulan\n\nDengan persiapan yang matang, pengalaman sewa mobil Anda akan menjadi lebih menyenangkan dan aman.`,
        authorId: admin.id,
        isPublished: true,
      },
    }),
    prisma.blogPost.create({
      data: {
        title: "5 Destinasi Wisata Terbaik yang Bisa Dijelajahi dengan Mobil Sewaan",
        slug: "destinasi-wisata-terbaik-mobil-sewaan",
        excerpt: "Jelajahi keindahan Indonesia dengan lebih leluasa menggunakan mobil sewaan. Berikut 5 destinasi wisata yang wajib dikunjungi.",
        content: `# 5 Destinasi Wisata Terbaik dengan Mobil Sewaan\n\nMobil sewaan memberikan kebebasan untuk menjelajahi destinasi wisata tanpa tergantung jadwal transportasi umum.\n\n## 1. Puncak, Bogor\n\nNikmati udara sejuk dan pemandangan kebun teh yang menakjubkan.\n\n## 2. Pangandaran, Jawa Barat\n\nPantai eksotis dengan akses mudah menggunakan kendaraan pribadi.\n\n## 3. Dieng, Jawa Tengah\n\nDataran tinggi penuh keajaiban alam dan situs bersejarah.\n\n## 4. Bromo, Jawa Timur\n\nKeajaiban vulkanik yang memukau saat matahari terbit.\n\n## 5. Flores, NTT\n\nSurga tersembunyi dengan keindahan alam yang belum banyak terjamah.`,
        authorId: admin.id,
        isPublished: true,
      },
    }),
  ]);
  console.log(`✅ ${posts.length} artikel dibuat`);

  // Buat FAQ
  const faqs = await Promise.all([
    prisma.faqItem.create({
      data: {
        question: "Dokumen apa saja yang diperlukan untuk menyewa mobil?",
        answer: "Anda memerlukan KTP asli yang masih berlaku, SIM A yang aktif, dan deposit tunai atau kartu kredit. Untuk penyewaan lebih dari 3 hari, kami juga meminta Kartu Keluarga.",
        order: 1,
        isActive: true,
      },
    }),
    prisma.faqItem.create({
      data: {
        question: "Berapa batas minimum usia untuk menyewa mobil?",
        answer: "Batas minimum usia penyewa adalah 21 tahun dan sudah memiliki SIM A yang aktif minimal 1 tahun.",
        order: 2,
        isActive: true,
      },
    }),
    prisma.faqItem.create({
      data: {
        question: "Apakah harga sudah termasuk BBM dan supir?",
        answer: "Harga yang tercantum adalah harga lepas kunci (tanpa supir dan BBM). Kami juga menyediakan paket dengan supir dengan biaya tambahan Rp 300.000 - Rp 500.000 per hari.",
        order: 3,
        isActive: true,
      },
    }),
    prisma.faqItem.create({
      data: {
        question: "Bagaimana prosedur pembatalan booking?",
        answer: "Pembatalan lebih dari 24 jam sebelum jadwal penyewaan tidak dikenakan biaya. Pembatalan kurang dari 24 jam dikenakan biaya 50% dari total sewa.",
        order: 4,
        isActive: true,
      },
    }),
    prisma.faqItem.create({
      data: {
        question: "Apakah ada deposit yang diperlukan?",
        answer: "Ya, kami memerlukan deposit sebesar Rp 500.000 - Rp 2.000.000 tergantung jenis mobil yang disewa. Deposit akan dikembalikan saat mobil dikembalikan dalam kondisi baik.",
        order: 5,
        isActive: true,
      },
    }),
    prisma.faqItem.create({
      data: {
        question: "Bolehkah saya menyewa mobil untuk dibawa keluar kota?",
        answer: "Ya, kami mengizinkan penyewa membawa mobil keluar kota. Namun harap informasikan tujuan Anda saat melakukan booking, dan ada biaya tambahan untuk perjalanan ke luar pulau.",
        order: 6,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${faqs.length} FAQ dibuat`);

  // Buat contoh booking
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 3);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2);

  await prisma.booking.create({
    data: {
      carId: cars[0].id,
      carName: cars[0].name,
      carBrand: cars[0].brand,
      carYear: cars[0].year,
      carType: cars[0].type,
      customerName: "Budi Santoso",
      customerWa: "081234567890",
      pickupDate: startDate,
      duration: 2,
      endDate: endDate,
      pickupLocation: "Kantor RentalKu, Jl. Sudirman No.1",
      driverOption: "lepas_kunci",
      selectedAdminName: "Admin 1",
      selectedAdminWa: "6281234567890",
      pricePerDay: cars[0].pricePerDay,
      totalPrice: cars[0].pricePerDay * 2,
      status: "CONFIRMED",
      customerNote: "Tolong siapkan di depan kantor",
      adminNote: "Sudah disiapkan di depan kantor",
    },
  });
  console.log("✅ Contoh booking dibuat");

  // Buat site config
  const configs = [
    { key: "site_name", value: "Bella Belly Trans Co" },
    { key: "site_tagline", value: "Sewa Mobil Terpercaya" },
    { key: "site_description", value: "Layanan sewa mobil terpercaya dengan armada lengkap dan harga terjangkau. Siap melayani perjalanan bisnis dan wisata Anda." },
    { key: "hero_title", value: "Sewa Mobil Mudah, Aman & Terpercaya" },
    { key: "hero_subtitle", value: "Tersedia berbagai pilihan armada mobil berkualitas dengan harga terjangkau. Pesan sekarang dan nikmati perjalanan Anda!" },
    { key: "about_title", value: "Tentang Bella Belly Trans Co" },
    { key: "about_description", value: "Sejak 2025 berkomitmen untuk melayani pemenuhan kebutuhan transportasi yang nyaman serta kesiapan armada prima." },
    { key: "about_vision", value: "Menjadi perusahaan rental mobil terdepan yang mengutamakan kepuasan dan keselamatan pelanggan." },
    { key: "contact_phone", value: "+62 813-2548-5262" },
    { key: "contact_email", value: "info@rentalku.com" },
    { key: "contact_address", value: "Jl. Sawunggaling Selatan No 48 Semarang" },
    { key: "contact_hours", value: "Senin - Minggu, 08:00 - 20:00 WIB" },
    { key: "whatsapp", value: "6281325485262" },
    { key: "instagram", value: "@bellabellyrentalmobilsmg" },
    { key: "TikTok", value: "@bellabellyrentalmobilsmg" },
    { key: "years_experience", value: "6+" },
    { key: "total_fleet", value: "50+" },
    { key: "happy_customers", value: "5000+" },
    { key: "service_areas", value: "20+" },
    { key: "google_maps_embed", value: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.4643530059825!2d110.43101067365318!3d-7.072036992930665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708f0077870a03%3A0xc7f930af53eb3867!2sBella%20Belly%20Trans%20Co!5e0!3m2!1sen!2sid!4v1783429219539!5m2!1sen!2sid" },
  ];

  await Promise.all(
    configs.map((c) =>
      prisma.siteConfig.create({ data: c })
    )
  );
  console.log(`✅ ${configs.length} konfigurasi website dibuat`);

  // Gallery items
  const galleryItems = await Promise.all(
    cars.slice(0, 4).map((car, i) =>
      prisma.galleryItem.create({
        data: {
          title: `${car.brand} ${car.name}`,
          description: `Armada ${car.type} berkualitas dari ${car.brand}`,
          imageUrl: `/uploads/placeholder-${i + 1}.jpg`,
          carId: car.id,
        },
      })
    )
  );
  console.log(`✅ ${galleryItems.length} item galeri dibuat`);

  console.log("\n🎉 Seeding selesai!");
  console.log("📧 Admin login: admin@rentalku.com / admin123");
  console.log("📧 Customer login: budi@example.com / customer123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
