"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { isValidCpf, maskCpfInput } from "@/domain/cpf";
import { Button } from "@/components/ui/button";
import { SummaryRow } from "@/components/summary-row";
import { formatCurrency } from "@/lib/format";
import { queryKeys, useCreateReservation } from "@/lib/queries";
import { isApiError } from "@/lib/api-error";
import type { TripDto, UserDto } from "@/lib/types";

interface PassengerFormProps {
  trip: TripDto;
  seatNumber: number;
  onSuccess: (reservationCode: string) => void;
}

interface PassengerFormValues {
  passengerName: string;
  passengerCpf: string;
  passengerEmail: string;
}

type PassengerFormErrors = Partial<PassengerFormValues>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: PassengerFormValues): PassengerFormErrors {
  const errors: PassengerFormErrors = {};

  if (values.passengerName.trim().length < 3) {
    errors.passengerName = "Informe seu nome completo.";
  }
  if (!isValidCpf(values.passengerCpf)) {
    errors.passengerCpf = "CPF inválido.";
  }
  if (!EMAIL_PATTERN.test(values.passengerEmail)) {
    errors.passengerEmail = "E-mail inválido.";
  }

  return errors;
}

export function PassengerForm({ trip, seatNumber, onSuccess }: PassengerFormProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<PassengerFormValues>(() => {
    const loggedInUser = queryClient.getQueryData<{ user: UserDto | null }>(
      queryKeys.currentUser,
    )?.user;

    return {
      passengerName: loggedInUser?.name ?? "",
      passengerCpf: loggedInUser ? maskCpfInput(loggedInUser.cpf) : "",
      passengerEmail: loggedInUser?.email ?? "",
    };
  });
  const [errors, setErrors] = useState<PassengerFormErrors>({});
  const createReservation = useCreateReservation();

  function updateField(field: keyof PassengerFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    createReservation.mutate(
      { tripId: trip.id, seatNumber, ...values },
      {
        onSuccess: (reservation) => {
          onSuccess(reservation.code);
        },
        onError: (error) => {
          toast.error(
            isApiError(error)
              ? error.message
              : "Sua reserva ainda não foi confirmada. Tente novamente.",
          );
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Dados do passageiro" className="mt-6 flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Dados do passageiro</h2>
        <div className="mt-4 flex flex-col gap-4">
          <TextField
            id="passengerName"
            label="Nome completo"
            value={values.passengerName}
            error={errors.passengerName}
            onChange={(value) => updateField("passengerName", value)}
          />
          <TextField
            id="passengerCpf"
            label="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            value={values.passengerCpf}
            error={errors.passengerCpf}
            onChange={(value) => updateField("passengerCpf", maskCpfInput(value))}
          />
          <TextField
            id="passengerEmail"
            label="E-mail"
            type="email"
            value={values.passengerEmail}
            error={errors.passengerEmail}
            onChange={(value) => updateField("passengerEmail", value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Resumo da compra</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <SummaryRow label="Trajeto" value={`${trip.route.origin} → ${trip.route.destination}`} />
          <SummaryRow label="Assento" value={String(seatNumber)} />
          <SummaryRow label="Passageiro" value={values.passengerName || "—"} />
          <SummaryRow label="Total" value={formatCurrency(trip.basePrice)} />
        </dl>
      </div>

      <Button type="submit" isLoading={createReservation.isPending} className="self-end">
        Confirmar reserva
      </Button>
    </form>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "email";
  onChange: (value: string) => void;
}

function TextField({
  id,
  label,
  value,
  error,
  type = "text",
  placeholder,
  inputMode = "text",
  onChange,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
          error ? "border-red-500 focus:border-red-600" : "border-slate-300 focus:border-blue-600"
        }`}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
