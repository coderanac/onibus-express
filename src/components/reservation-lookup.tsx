"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { formatCpf } from "@/domain/cpf";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SummaryRow } from "@/components/summary-row";
import { TripSummary } from "@/components/trip-summary";
import { isApiError } from "@/lib/api-error";
import { useCancelReservation, useReservationByCode } from "@/lib/queries";

export function ReservationLookup({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [searchedCode, setSearchedCode] = useState(initialCode.trim().toUpperCase());
  const { data: reservation, isLoading, isError, error } = useReservationByCode(
    searchedCode,
    searchedCode.length > 0,
  );
  const cancelReservation = useCancelReservation();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchedCode(code.trim().toUpperCase());
  }

  function handleConfirmCancel() {
    if (!reservation) return;

    cancelReservation.mutate(reservation.code, {
      onSuccess: () => {
        toast.success("Reserva cancelada com sucesso.");
        setIsCancelDialogOpen(false);
      },
      onError: (cancelError) => {
        toast.error(
          isApiError(cancelError)
            ? cancelError.message
            : "Não foi possível cancelar a reserva.",
        );
        setIsCancelDialogOpen(false);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} aria-label="Consultar reserva" className="flex gap-3">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Código da reserva (ex: ABC-12345)"
          aria-label="Código da reserva"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-600 focus:outline-none"
        />
        <Button type="submit" isLoading={isLoading && searchedCode.length > 0}>
          Buscar
        </Button>
      </form>

      {isError ? (
        <p className="text-sm text-red-600">
          {isApiError(error) ? error.message : "Reserva não encontrada."}
        </p>
      ) : null}

      {reservation ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <TripSummary trip={reservation.trip} />
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <SummaryRow label="Código" value={reservation.code} />
            <SummaryRow label="Assento" value={String(reservation.seatNumber)} />
            <SummaryRow label="Passageiro" value={reservation.passengerName} />
            <SummaryRow label="CPF" value={formatCpf(reservation.passengerCpf)} />
            <SummaryRow
              label="Status"
              value={reservation.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}
            />
          </dl>

          {reservation.status === "CONFIRMED" ? (
            <Button
              variant="danger"
              onClick={() => setIsCancelDialogOpen(true)}
              className="self-start"
            >
              Cancelar reserva
            </Button>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={isCancelDialogOpen}
        title="Cancelar reserva"
        description={`Tem certeza que deseja cancelar a reserva ${reservation?.code}? Essa ação não pode ser desfeita.`}
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        isLoading={cancelReservation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </div>
  );
}
