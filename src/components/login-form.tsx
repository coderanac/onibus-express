"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api-error";
import { useLogin } from "@/lib/queries";

interface LoginFormValues {
  email: string;
  password: string;
}

type LoginFormErrors = Partial<LoginFormValues>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const login = useLogin();
  const [values, setValues] = useState<LoginFormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  function updateField(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate(): LoginFormErrors {
    const validationErrors: LoginFormErrors = {};
    if (!EMAIL_PATTERN.test(values.email)) {
      validationErrors.email = "E-mail inválido.";
    }
    if (values.password.length < 1) {
      validationErrors.password = "Informe sua senha.";
    }
    return validationErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    login.mutate(values, {
      onSuccess: (user) => {
        toast.success(`Bem-vindo, ${user.name.split(" ")[0]}!`);
        router.push(redirectTo);
      },
      onError: (error) => {
        toast.error(isApiError(error) ? error.message : "Não foi possível entrar.");
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Entrar com e-mail e senha"
      className="flex flex-col gap-4"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
            errors.email
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-primary-600"
          }`}
        />
        {errors.email ? (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={values.password}
          onChange={(event) => updateField("password", event.target.value)}
          aria-invalid={Boolean(errors.password)}
          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
            errors.password
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-primary-600"
          }`}
        />
        {errors.password ? (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        ) : null}
      </div>

      <Button type="submit" isLoading={login.isPending} className="mt-2">
        Entrar
      </Button>
    </form>
  );
}
