"use client";

import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useCurrentUser, useMyReservations } from "@/lib/queries";

export function MyReservations() {
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { data: reservations, isLoading: isLoadingReservations } = useMyReservations(
    Boolean(user),
  );

  if (isLoadingUser) {
    return null;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-600">
          Entre com seu e-mail e senha para ver suas reservas.
        </p>
        <Link
          href="/entrar?redirectTo=/minhas-reservas"
          className="mt-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Entrar
        </Link>
      </div>
    );
  }

  if (isLoadingReservations) {
    return <p className="text-sm text-slate-600">Carregando reservas...</p>;
  }

  if (!reservations || reservations.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Você ainda não fez nenhuma reserva com esta conta.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {reservations.map((reservation) => (
        <li key={reservation.id}>
          <Link
            href={`/reservas/consulta?codigo=${reservation.code}`}
            className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900">
                {reservation.trip.route.origin} → {reservation.trip.route.destination}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  reservation.status === "CONFIRMED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {reservation.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {formatDateTime(reservation.trip.departureAt)} · Assento{" "}
              {reservation.seatNumber}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Código {reservation.code} · {formatCurrency(reservation.trip.basePrice)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
