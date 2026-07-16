import Link from "next/link";

export default async function ReservationSuccessPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const code = codigo.toUpperCase();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Reserva confirmada!</h1>
      <p className="mt-2 text-slate-600">
        Guarde o código abaixo para consultar ou cancelar sua reserva.
      </p>
      <p className="mt-6 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 py-4 text-3xl font-bold tracking-widest text-primary-700">
        {code}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Nova busca
        </Link>
        <Link
          href={`/reservas/consulta?codigo=${code}`}
          className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
        >
          Ver detalhes da reserva
        </Link>
      </div>
    </div>
  );
}
