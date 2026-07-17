import { ReservationLookup } from "@/components/reservation-lookup";

export default async function ReservationConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Consultar reserva</h1>
      <p className="mt-1 text-slate-600">
        Digite o código da sua reserva para ver os detalhes ou cancelar.
      </p>
      <div className="mt-6">
        <ReservationLookup initialCode={codigo ?? ""} />
      </div>
    </div>
  );
}
