import { z } from "zod";

export const searchTripsQuerySchema = z.object({
  origin: z.string().trim().min(1).optional(),
  destination: z.string().trim().min(1).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD.")
    .optional(),
});

export const createReservationBodySchema = z.object({
  tripId: z.string().min(1, "Viagem é obrigatória."),
  seatNumber: z.coerce.number().int().positive("Assento inválido."),
  passengerName: z
    .string()
    .trim()
    .min(3, "Nome completo é obrigatório."),
  passengerCpf: z.string().min(11, "CPF é obrigatório."),
  passengerEmail: z.string().trim().email("E-mail inválido."),
});

export const reservationCodeParamSchema = z
  .string()
  .regex(/^[A-Za-z]{3}-\d{5}$/, "Código de reserva inválido.");

export const registerBodySchema = z.object({
  name: z.string().trim().min(1, "Nome completo é obrigatório."),
  cpf: z.string().min(11, "CPF é obrigatório."),
  email: z.string().trim().email("E-mail inválido."),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento deve estar no formato AAAA-MM-DD."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string().min(1, "Confirme sua senha."),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(1, "Senha é obrigatória."),
});
