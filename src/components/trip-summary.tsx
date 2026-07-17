import { formatCurrency, formatDateTime, formatDuration } from "@/lib/format";
import type { TripDto } from "@/lib/types";

export function TripSummary({ trip }: { trip: TripDto }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-lg font-semibold text-slate-900">
        {trip.route.origin} → {trip.route.destination}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {formatDateTime(trip.departureAt)} · Duração{" "}
        {formatDuration(trip.route.durationMinutes)}
      </p>
      <p className="mt-3 text-2xl font-bold text-primary-700">
        {formatCurrency(trip.basePrice)}
      </p>
    </div>
  );
}
