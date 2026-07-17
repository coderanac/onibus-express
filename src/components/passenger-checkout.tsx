"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PassengerForm } from "@/components/passenger-form";
import { TripSummary } from "@/components/trip-summary";
import { useTripDetails } from "@/lib/queries";

interface PassengerCheckoutProps {
  tripId: string;
  seatNumber: number;
}

export function PassengerCheckout({ tripId, seatNumber }: PassengerCheckoutProps) {
  const router = useRouter();
  const { data: trip, isLoading, isError } = useTripDetails(tripId);

  if (isLoading) {
    return <p className="p-10 text-center text-slate-500">Carregando viagem...</p>;
  }

  if (isError || !trip || !seatNumber) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">Não foi possível carregar os dados da reserva.</p>
        <Link
          href={`/viagens/${tripId}`}
          className="mt-4 inline-block text-primary-700 underline"
        >
          Voltar para seleção de assento
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Confirme sua reserva</h1>
      <div className="mt-6">
        <TripSummary trip={trip} />
      </div>
      <PassengerForm
        trip={trip}
        seatNumber={seatNumber}
        onSuccess={(code) => router.push(`/reservas/sucesso/${code}`)}
      />
    </div>
  );
}
