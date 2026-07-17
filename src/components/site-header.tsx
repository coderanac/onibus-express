"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCurrentUser, useLogout } from "@/lib/queries";

export function SiteHeader() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Você saiu da sua conta.");
        setIsMenuOpen(false);
        router.push("/");
      },
    });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
          <Image src="/logo.png" alt="OniBus Express" width={160} height={53} priority />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {user ? (
            <Link
              href="/minhas-reservas"
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              Minhas reservas
            </Link>
          ) : (
            <Link
              href="/reservas/consulta"
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              Consultar reserva
            </Link>
          )}
          <Link
            href="/docs"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Docs da API
          </Link>
          {user ? (
            <span className="flex items-center gap-3 text-sm">
              <span className="text-slate-600">Olá, {user.name.split(" ")[0]}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="font-medium text-slate-500 hover:text-slate-700"
              >
                Sair
              </button>
            </span>
          ) : (
            <Link
              href="/entrar"
              className="rounded-lg bg-primary-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Entrar
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          className="flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-6 w-6"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-slate-200 px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {user ? (
              <Link
                href="/minhas-reservas"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-primary-700 hover:text-primary-900"
              >
                Minhas reservas
              </Link>
            ) : (
              <Link
                href="/reservas/consulta"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-primary-700 hover:text-primary-900"
              >
                Consultar reserva
              </Link>
            )}
            <Link
              href="/docs"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Docs da API
            </Link>
            {user ? (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-600">Olá, {user.name.split(" ")[0]}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-medium text-slate-500 hover:text-slate-700"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/entrar"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-800"
              >
                Entrar
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
