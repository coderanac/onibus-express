"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { isValidCpf, maskCpfInput } from "@/domain/cpf";
import { parseBrDateToIso } from "@/domain/date";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { isApiError } from "@/lib/api-error";
import { useRegister } from "@/lib/queries";

interface RegisterFormValues {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type RegisterFormErrors = Partial<RegisterFormValues>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const INITIAL_VALUES: RegisterFormValues = {
  name: "",
  cpf: "",
  birthDate: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validate(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (values.name.trim().length < 3) {
    errors.name = "Informe seu nome completo.";
  }
  if (!isValidCpf(values.cpf)) {
    errors.cpf = "CPF inválido.";
  }
  const birthDateIso = parseBrDateToIso(values.birthDate);
  if (!birthDateIso || new Date(birthDateIso).getTime() >= Date.now()) {
    errors.birthDate = "Informe uma data de nascimento válida.";
  }
  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "E-mail inválido.";
  }
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "As senhas não coincidem.";
  }

  return errors;
}

export function RegisterForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const register = useRegister();
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  function updateField(field: keyof RegisterFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const birthDateIso = parseBrDateToIso(values.birthDate) ?? values.birthDate;

    register.mutate({ ...values, birthDate: birthDateIso }, {
      onSuccess: (user) => {
        toast.success(`Conta criada! Bem-vindo, ${user.name.split(" ")[0]}.`);
        router.push(redirectTo);
      },
      onError: (error) => {
        toast.error(isApiError(error) ? error.message : "Não foi possível criar sua conta.");
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Criar conta" className="flex flex-col gap-4">
      <TextField
        id="name"
        label="Nome completo"
        value={values.name}
        error={errors.name}
        onChange={(value) => updateField("name", value)}
      />
      <TextField
        id="cpf"
        label="CPF"
        placeholder="000.000.000-00"
        inputMode="numeric"
        value={values.cpf}
        error={errors.cpf}
        onChange={(value) => updateField("cpf", maskCpfInput(value))}
      />
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">
          Data de nascimento
        </label>
        <DateInput
          id="birthDate"
          value={values.birthDate}
          error={Boolean(errors.birthDate)}
          onChange={(value) => updateField("birthDate", value)}
          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
            errors.birthDate
              ? "border-red-500 focus:border-red-600"
              : "border-slate-300 focus:border-primary-600"
          }`}
        />
        {errors.birthDate ? (
          <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
        ) : null}
      </div>
      <TextField
        id="email"
        label="E-mail"
        type="email"
        value={values.email}
        error={errors.email}
        onChange={(value) => updateField("email", value)}
      />
      <TextField
        id="password"
        label="Senha"
        type="password"
        value={values.password}
        error={errors.password}
        onChange={(value) => updateField("password", value)}
      />
      <TextField
        id="confirmPassword"
        label="Confirmar senha"
        type="password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(value) => updateField("confirmPassword", value)}
      />

      <Button type="submit" isLoading={register.isPending} className="mt-2">
        Criar conta
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
  maxLength?: number;
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
  maxLength,
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
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
          error ? "border-red-500 focus:border-red-600" : "border-slate-300 focus:border-primary-600"
        }`}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
