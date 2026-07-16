"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SeatMap } from "@/components/seat-map";
import { TripSummary } from "@/components/trip-summary";
import { useTripDetails } from "@/lib/queries";

export function TripSeatSelection({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { data: trip, isLoading, isError } = useTripDetails(tripId);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  if (isLoading) {
    return <p className="p-10 text-center text-slate-500">Carregando viagem...</p>;
  }

  if (isError || !trip) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">Viagem não encontrada.</p>
        <Link href="/" className="mt-4 inline-block text-primary-700 underline">
          Voltar para a busca
        </Link>
      </div>
    );
  }

  function handleContinue() {
    if (!selectedSeat) return;
    router.push(`/viagens/${trip!.id}/passageiro?assento=${selectedSeat}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <TripSummary trip={trip} />
      <h2 className="mt-8 text-lg font-semibold text-slate-900">Escolha seu assento</h2>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SeatMap
          totalSeats={trip.totalSeats}
          occupiedSeats={trip.occupiedSeats}
          selectedSeat={selectedSeat}
          onSelectSeat={setSelectedSeat}
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleContinue} disabled={!selectedSeat}>
          {selectedSeat ? `Continuar com o assento ${selectedSeat}` : "Selecione um assento"}
        </Button>
      </div>
    </div>
  );
}
