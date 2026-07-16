import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROUTES = [
  { origin: "São Paulo", destination: "Rio de Janeiro", durationMinutes: 360 },
  { origin: "Rio de Janeiro", destination: "São Paulo", durationMinutes: 360 },
  { origin: "São Paulo", destination: "Curitiba", durationMinutes: 480 },
  { origin: "Curitiba", destination: "São Paulo", durationMinutes: 480 },
  { origin: "Belo Horizonte", destination: "São Paulo", durationMinutes: 420 },
  { origin: "São Paulo", destination: "Belo Horizonte", durationMinutes: 420 },
];

const DEPARTURE_HOURS = [6, 13, 22];
const DAYS_AHEAD = 5;
const TOTAL_SEATS = 40;
const BASE_PRICE_BY_DURATION_MINUTE = 0.6;

function departureAt(daysAhead: number, hour: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  const existingRoutesCount = await prisma.route.count();
  if (existingRoutesCount > 0) {
    console.log("Banco de dados já populado, seed ignorado.");
    return;
  }

  for (const routeData of ROUTES) {
    const route = await prisma.route.create({ data: routeData });
    const basePrice = Math.round(routeData.durationMinutes * BASE_PRICE_BY_DURATION_MINUTE * 1.8);

    for (let day = 1; day <= DAYS_AHEAD; day += 1) {
      for (const hour of DEPARTURE_HOURS) {
        await prisma.trip.create({
          data: {
            routeId: route.id,
            departureAt: departureAt(day, hour),
            basePrice,
            totalSeats: TOTAL_SEATS,
          },
        });
      }
    }
  }

  const tripsCreated = await prisma.trip.count();
  const routesCreated = await prisma.route.count();
  console.log(`Seed concluído: ${routesCreated} rotas e ${tripsCreated} viagens criadas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
