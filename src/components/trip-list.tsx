import Link from "next/link";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/format";
import type { TripSearchResultDto } from "@/lib/types";

interface TripListProps {
  trips: TripSearchResultDto[];
  isLoading: boolean;
  hasSearched: boolean;
}

export function TripList({ trips, isLoading, hasSearched }: TripListProps) {
  if (!hasSearched) {
    return null;
  }

  if (isLoading) {
    return (
      <p role="status" className="mt-8 text-center text-slate-500">
        Buscando viagens...
      </p>
    );
  }

  if (trips.length === 0) {
    return (
      <p className="mt-8 text-center text-slate-500">
        Nenhuma viagem encontrada para esta busca.
      </p>
    );
  }

  return (
    <ul className="mt-8 flex flex-col gap-3">
      {trips.map((trip) => (
        <li
          key={trip.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <p className="font-semibold text-slate-900">
              {trip.route.origin} → {trip.route.destination}
            </p>
            <p className="text-sm text-slate-500">
              {formatDateTime(trip.departureAt)} · Duração{" "}
              {formatDuration(trip.route.durationMinutes)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-slate-900">{formatCurrency(trip.basePrice)}</p>
              <p className="text-sm text-slate-500">
                {trip.availableSeats > 0
                  ? `${trip.availableSeats} vagas restantes`
                  : "Esgotado"}
              </p>
            </div>
            {trip.availableSeats > 0 ? (
              <Link
                href={`/viagens/${trip.id}`}
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
              >
                Selecionar
              </Link>
            ) : (
              <span className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">
                Esgotado
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
