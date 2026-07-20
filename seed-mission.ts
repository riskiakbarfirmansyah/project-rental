import { prisma } from './lib/prisma';

const configs = [
  { key: 'about_mission', value: 'Memberikan pelayanan terbaik (unit, customer service, administrasi) * Keamanan, kenyamanan, keselamatan berkendara dan kepuasan pelanggan prioritas kami * Siap menerima masukan & melakukan perubahan ke arah yang lebih baik' },
  { key: 'about_vision', value: 'Menjadi perusahaan rental mobil terdepan yang mengutamakan kepuasan dan keselamatan pelanggan.' }
];

async function main() {
  for (let c of configs) {
    await prisma.siteConfig.upsert({
      where: { key: c.key },
      update: {},
      create: c
    });
  }
  console.log('Seed mission done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
