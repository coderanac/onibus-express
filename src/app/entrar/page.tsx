import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
      <p className="mt-1 text-sm text-slate-600">
        Use seu e-mail e senha para acessar sua conta e ver suas reservas.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <LoginForm redirectTo={redirectTo ?? "/"} />
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">
        Ainda não tem conta?{" "}
        <Link
          href={`/criar-conta${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
          className="font-semibold text-primary-700 hover:text-primary-900"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
