import { z } from "zod";

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  specialty: z.string().optional(),
});

export const premiumRegisterSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme sua senha"),
    slug: z
      .string()
      .min(3, "Link deve ter no mínimo 3 caracteres")
      .max(40)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens"),
    specialty: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const patientSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  cpf: z.string().refine(validateCPF, "CPF inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido"),
  birthDate: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_SAY"]).optional(),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  cpf: z.string().refine(validateCPF, "CPF inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido"),
  birthDate: z.string().min(1, "Data de nascimento obrigatória"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_SAY"]),
  notes: z.string().optional(),
  reason: z.string().min(3, "Motivo da consulta obrigatório"),
  date: z.string(),
  startTime: z.string(),
  slug: z.string(),
});

export const appointmentSchema = z.object({
  patientId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  type: z.enum(["INITIAL", "FOLLOW_UP", "ONLINE", "IN_PERSON", "EMERGENCY"]),
  price: z.number().positive(),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

export const settingsSchema = z.object({
  name: z.string().min(2).optional(),
  specialty: z.string().optional(),
  avatar: z.union([z.literal(""), z.string().url()]).optional(),
  defaultDuration: z.number().min(15).max(180).optional(),
  defaultPrice: z.number().min(0).optional(),
  workStartHour: z.number().min(0).max(23).optional(),
  workEndHour: z.number().min(0).max(23).optional(),
  workDays: z.array(z.number().min(0).max(6)).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  reminderMinutes: z.number().min(5).max(120).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  landingHeadline: z.string().max(120).optional(),
  landingBio: z.string().max(3000).optional(),
  yearsExperience: z.number().min(0).max(60).optional(),
  birthPlace: z.string().max(120).optional(),
  education: z.string().max(200).optional(),
  specializationText: z.string().max(300).optional(),
  officeAddress: z.string().max(300).optional(),
  officeCity: z.string().max(100).optional(),
  officeState: z.string().max(2).optional(),
  officeZip: z.string().max(12).optional(),
  showBirthPlace: z.boolean().optional(),
  landingPublished: z.boolean().optional(),
});

export const reviewSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().refine(validateCPF, "CPF inválido"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(800),
  slug: z.string(),
});

export const galleryImageSchema = z.object({
  imageUrl: z
    .string()
    .min(1, "URL da imagem obrigatória")
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//i.test(v),
      "URL da imagem inválida"
    ),
  caption: z.string().max(200).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
