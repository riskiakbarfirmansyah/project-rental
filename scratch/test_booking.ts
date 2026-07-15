import { prisma } from "../lib/prisma";

async function main() {
  try {
    const car = await prisma.car.findFirst();
    if (!car) {
      console.log("No cars found!");
      return;
    }
    console.log("Found car:", car.brand, car.name);

    const start = new Date("2026-07-15");
    const end = new Date(start);
    end.setDate(end.getDate() + 3);

    const booking = await prisma.booking.create({
      data: {
        carId: car.id,
        carName: car.name,
        carBrand: car.brand,
        carYear: car.year,
        carType: car.type,
        customerName: "Test Pelanggan",
        customerWa: "081234567890",
        pickupDate: start,
        duration: 3,
        endDate: end,
        pickupLocation: "Semarang",
        driverOption: "lepas_kunci",
        selectedAdminName: "Admin 1",
        selectedAdminWa: "6281234567890",
        pricePerDay: car.pricePerDay,
        totalPrice: car.pricePerDay * 3,
        customerNote: "Catatan pengetesan",
        status: "PENDING_CONFIRMATION",
      },
    });
    console.log("SUCCESS created booking:", booking.id);
  } catch (error) {
    console.error("ERROR creating booking:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
