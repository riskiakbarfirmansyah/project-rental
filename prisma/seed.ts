import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

function parseDbUrl(url: string) {
  try {
    const u = new URL(url);
    return { host: u.hostname, port: u.port ? parseInt(u.port) : 3306, user: u.username || "root", password: u.password || "", database: u.pathname.slice(1) };
  } catch {
    return { host: "localhost", port: 3306, user: "root", password: "", database: "rental_db" };
  }
}

const adapter = new PrismaMariaDb(parseDbUrl(process.env.DATABASE_URL || "mysql://root:@localhost:3306/rental_db"));
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 Memulai seeding database...");

  // Hapus data lama
  await prisma.contactMessage.deleteMany();
  await prisma.galleryItem.deleteMany();
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
  const cars = await Promise.all([
    prisma.car.create({
      data: {
        name: "Avanza 2023",
        brand: "Toyota",
        year: 2023,
        type: "MPV",
        pricePerDay: 350000,
        seats: 7,
        transmission: "MANUAL",
        fuel: "BENSIN",
        description: "Toyota Avanza 2023 adalah MPV keluarga yang nyaman dan irit bahan bakar. Cocok untuk perjalanan keluarga maupun bisnis.",
        features: JSON.stringify(["AC", "GPS", "Bluetooth", "USB Charger", "Kamera Mundur"]),
        images: JSON.stringify([]),
        isAvailable: true,
      },
    }),
    prisma.car.create({
      data: {
        name: "Innova Reborn 2022",
        brand: "Toyota",
        year: 2022,
        type: "MPV",
        pricePerDay: 650000,
        seats: 7,
        transmission: "AUTOMATIC",
        fuel: "DIESEL",
        description: "Toyota Innova Reborn diesel automatic, nyaman untuk perjalanan jauh. Interior mewah dengan hiburan premium.",
        features: JSON.stringify(["AC Double", "GPS", "Bluetooth", "Leather Seat", "Sunroof", "Kamera 360"]),
        images: JSON.stringify([]),
        isAvailable: true,
      },
    }),
    prisma.car.create({
      data: {
        name: "Fortuner 2023",
        brand: "Toyota",
        year: 2023,
        type: "SUV",
        pricePerDay: 900000,
        seats: 7,
        transmission: "AUTOMATIC",
        fuel: "DIESEL",
        description: "Toyota Fortuner SUV premium dengan performa tangguh. Ideal untuk wisata alam maupun perjalanan VIP.",
        features: JSON.stringify(["AC Double", "GPS", "Bluetooth", "Leather Seat", "Kamera 360", "Cruise Control", "Hill Start Assist"]),
        images: JSON.stringify([]),
        isAvailable: true,
      },
    }),
    prisma.car.create({
      data: {
        name: "Xpander 2023",
        brand: "Mitsubishi",
        year: 2023,
        type: "MPV",
        pricePerDay: 400000,
        seats: 7,
        transmission: "AUTOMATIC",
        fuel: "BENSIN",
        description: "Mitsubishi Xpander cross dengan tampilan stylish dan kabin lega. Sempurna untuk keluarga muda.",
        features: JSON.stringify(["AC", "GPS", "Bluetooth", "USB Charger", "Kamera Mundur", "ECO Mode"]),
        images: JSON.stringify([]),
        isAvailable: true,
      },
    }),
    prisma.car.create({
      data: {
        name: "HR-V 2022",
        brand: "Honda",
        year: 2022,
        type: "SUV",
        pricePerDay: 550000,
        seats: 5,
        transmission: "AUTOMATIC",
        fuel: "BENSIN",
        description: "Honda HR-V SUV compact dengan desain sporty. Efisien bahan bakar dan nyaman dikendarai.",
        features: JSON.stringify(["AC", "GPS", "Bluetooth", "Touchscreen", "Kamera Mundur", "Paddle Shift"]),
        images: JSON.stringify([]),
        isAvailable: true,
      },
    }),
    prisma.car.create({
      data: {
        name: "Alphard 2022",
        brand: "Toyota",
        year: 2022,
        type: "MPV",
        pricePerDay: 1500000,
        seats: 7,
        transmission: "AUTOMATIC",
        fuel: "BENSIN",
        description: "Toyota Alphard, kendaraan VIP mewah kelas executive. Pengalaman berkendara setara bisnis class.",
        features: JSON.stringify(["AC Executive", "GPS", "Bluetooth", "Captain Seat", "Sunroof", "Entertainment System", "Refrigerator"]),
        images: JSON.stringify([]),
        isAvailable: true,
      },
    }),
  ]);
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
      userId: customer.id,
      carId: cars[0].id,
      startDate,
      endDate,
      totalDays: 2,
      totalPrice: 700000,
      pickupLocation: "Kantor RentalKu, Jl. Sudirman No.1",
      notes: "Tolong siapkan di depan kantor",
      status: "CONFIRMED",
    },
  });
  console.log("✅ Contoh booking dibuat");

  // Buat site config
  const configs = [
    { key: "site_name", value: "RentalKu" },
    { key: "site_tagline", value: "Sewa Mobil Terpercaya" },
    { key: "site_description", value: "Layanan sewa mobil terpercaya dengan armada lengkap dan harga terjangkau. Siap melayani perjalanan bisnis dan wisata Anda." },
    { key: "hero_title", value: "Sewa Mobil Mudah, Aman & Terpercaya" },
    { key: "hero_subtitle", value: "Tersedia berbagai pilihan armada mobil berkualitas dengan harga terjangkau. Pesan sekarang dan nikmati perjalanan Anda!" },
    { key: "about_title", value: "Tentang RentalKu" },
    { key: "about_description", value: "RentalKu hadir sejak 2018 sebagai penyedia layanan sewa mobil terpercaya. Dengan armada lebih dari 50 unit kendaraan, kami siap membantu setiap kebutuhan perjalanan Anda." },
    { key: "about_vision", value: "Menjadi perusahaan rental mobil terdepan yang mengutamakan kepuasan dan keselamatan pelanggan." },
    { key: "contact_phone", value: "+62 812-3456-7890" },
    { key: "contact_email", value: "info@rentalku.com" },
    { key: "contact_address", value: "Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta 10220" },
    { key: "contact_hours", value: "Senin - Minggu, 08:00 - 20:00 WIB" },
    { key: "whatsapp", value: "+6281234567890" },
    { key: "instagram", value: "@rentalku_id" },
    { key: "facebook", value: "RentalKuIndonesia" },
    { key: "years_experience", value: "6+" },
    { key: "total_fleet", value: "50+" },
    { key: "happy_customers", value: "5000+" },
    { key: "service_areas", value: "20+" },
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
