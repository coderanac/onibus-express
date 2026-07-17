import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
      <p className="mt-1 text-sm text-slate-600">
        Cadastre seus dados uma vez para não precisar redigitá-los nas próximas compras.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RegisterForm redirectTo={redirectTo ?? "/"} />
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">
        Já tem conta?{" "}
        <Link
          href={`/entrar${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
          className="font-semibold text-primary-700 hover:text-primary-900"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
