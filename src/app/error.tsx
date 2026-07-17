"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorScreen({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <div className="text-5xl">🔧</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Estamos trocando os pneus.
      </h1>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
      >
        Voltar para tela principal
      </Link>
    </div>
  );
}
