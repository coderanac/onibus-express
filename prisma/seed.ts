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
const TOTAL_SEATS = 40;
const BASE_PRICE_BY_DURATION_MINUTE = 0.6;

/** Quantidade de dias, a partir de hoje, até o último dia do mês que vem. */
function daysAheadUntilEndOfNextMonth(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const diffMs = endOfNextMonth.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

const DAYS_AHEAD = daysAheadUntilEndOfNextMonth();

function departureAt(daysAhead: number, hour: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  const basePriceByRoute = new Map<string, number>();

  for (const routeData of ROUTES) {
    let route = await prisma.route.findFirst({
      where: { origin: routeData.origin, destination: routeData.destination },
    });
    if (!route) {
      route = await prisma.route.create({ data: routeData });
    }

    const basePrice = Math.round(
      routeData.durationMinutes * BASE_PRICE_BY_DURATION_MINUTE * 1.8,
    );
    basePriceByRoute.set(route.id, basePrice);

    for (let day = 0; day <= DAYS_AHEAD; day += 1) {
      for (const hour of DEPARTURE_HOURS) {
        const targetDepartureAt = departureAt(day, hour);
        const existingTrip = await prisma.trip.findFirst({
          where: { routeId: route.id, departureAt: targetDepartureAt },
        });
        if (existingTrip) {
          continue;
        }

        await prisma.trip.create({
          data: {
            routeId: route.id,
            departureAt: targetDepartureAt,
            basePrice,
            totalSeats: TOTAL_SEATS,
          },
        });
      }
    }
  }

  const tripsCreated = await prisma.trip.count();
  const routesCreated = await prisma.route.count();
  console.log(
    `Seed concluído: ${routesCreated} rotas e ${tripsCreated} viagens (disponibilidade até ${DAYS_AHEAD} dias a partir de hoje).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
