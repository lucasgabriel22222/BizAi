/**
 * reset-and-seed.ts
 * Deletes ALL existing data and creates a fresh, rich demo account.
 * Run with: npx tsx scripts/reset-and-seed.ts
 */
import {
  PrismaClient,
  AppointmentStatus,
  AppointmentType,
  Gender,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Limpando banco de dados...");

  // Delete in dependency order so FK constraints don't break
  await prisma.notification.deleteMany();
  await prisma.patientReview.deleteMany();
  await prisma.profileGalleryImage.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.break.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Banco limpo!");
  console.log("🌱 Criando conta demo...");

  const password = await bcrypt.hash("demo123456", 12);

  const user = await prisma.user.create({
    data: {
      email: "demo@clinica.com",
      password,
      name: "Dra. Ana Silva",
      slug: "ana-silva",
      specialty: "Psicologia Clínica",
      settings: {
        create: {
          defaultDuration: 50,
          defaultPrice: 250,
          workStartHour: 8,
          workEndHour: 18,
          workDays: [1, 2, 3, 4, 5],
          landingHeadline: "Acolhimento e cuidado com sua saúde mental",
          landingBio:
            "Psicóloga clínica com 8 anos de experiência, especialista em TCC com foco em ansiedade, depressão e autoconhecimento. Atendimento humanizado em ambiente acolhedor.",
          yearsExperience: 8,
          education: "Graduação em Psicologia — PUC-SP",
          specializationText:
            "Especialista em Terapia Cognitivo-Comportamental (TCC)",
          officeAddress: "Rua das Flores, 123 — Sala 45",
          officeCity: "São Paulo",
          officeState: "SP",
          officeZip: "01310-100",
          showBirthPlace: true,
          birthPlace: "São Paulo, SP",
          landingPublished: true,
        },
      },
    },
  });

  console.log("👤 Usuário demo criado:", user.email);

  // ─── Pacientes ────────────────────────────────────────────────────
  const [maria, joao, carla, pedro, lucia] = await Promise.all([
    prisma.patient.create({
      data: {
        userId: user.id,
        name: "Maria Santos",
        cpf: "12345678901",
        phone: "(11) 98765-0001",
        email: "maria.santos@email.com",
        birthDate: new Date("1990-05-15"),
        gender: Gender.FEMALE,
        notes: "Paciente com histórico de ansiedade. Em tratamento há 6 meses.",
      },
    }),
    prisma.patient.create({
      data: {
        userId: user.id,
        name: "João Oliveira",
        cpf: "98765432100",
        phone: "(11) 98765-0002",
        email: "joao.oliveira@email.com",
        birthDate: new Date("1985-08-22"),
        gender: Gender.MALE,
        notes: "Trabalha com burnout. Comprometido com o processo terapêutico.",
      },
    }),
    prisma.patient.create({
      data: {
        userId: user.id,
        name: "Carla Mendes",
        cpf: "11122233344",
        phone: "(11) 98765-0003",
        email: "carla.mendes@email.com",
        birthDate: new Date("1995-12-03"),
        gender: Gender.FEMALE,
        notes: "Paciente nova, em avaliação inicial.",
      },
    }),
    prisma.patient.create({
      data: {
        userId: user.id,
        name: "Pedro Alves",
        cpf: "55566677788",
        phone: "(11) 98765-0004",
        email: "pedro.alves@email.com",
        birthDate: new Date("1978-03-10"),
        gender: Gender.MALE,
        notes: "Dificuldades com relacionamentos. Em processo de autoconhecimento.",
      },
    }),
    prisma.patient.create({
      data: {
        userId: user.id,
        name: "Lúcia Ferreira",
        cpf: "99988877766",
        phone: "(11) 98765-0005",
        email: "lucia.ferreira@email.com",
        birthDate: new Date("2000-07-28"),
        gender: Gender.FEMALE,
        notes: "Jovem com questões de autoestima. Muito receptiva à terapia.",
      },
    }),
  ]);

  const patients = [maria, joao, carla, pedro, lucia];
  console.log(`👥 ${patients.length} pacientes criados`);

  // ─── Consultas (passadas + futuras) ───────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments: {
    daysOffset: number;
    patientIdx: number;
    hour: number;
    status: AppointmentStatus;
    type: AppointmentType;
    price: number;
    reason: string;
    notes?: string;
  }[] = [
    // — Passadas (concluídas) —
    { daysOffset: -14, patientIdx: 0, hour: 9,  status: AppointmentStatus.COMPLETED, type: AppointmentType.IN_PERSON, price: 250, reason: "Acompanhamento quinzenal", notes: "Boa evolução, técnicas de respiração discutidas." },
    { daysOffset: -14, patientIdx: 1, hour: 10, status: AppointmentStatus.COMPLETED, type: AppointmentType.ONLINE,    price: 220, reason: "Sessão de follow-up", notes: "Relato de melhora significativa no trabalho." },
    { daysOffset: -12, patientIdx: 2, hour: 14, status: AppointmentStatus.COMPLETED, type: AppointmentType.IN_PERSON, price: 250, reason: "Avaliação inicial", notes: "Primeira sessão concluída. Encaminhamento em análise." },
    { daysOffset: -10, patientIdx: 3, hour: 9,  status: AppointmentStatus.COMPLETED, type: AppointmentType.IN_PERSON, price: 250, reason: "Terapia de relacionamento", notes: "Trabalho de escuta ativa aplicado." },
    { daysOffset: -9,  patientIdx: 0, hour: 11, status: AppointmentStatus.COMPLETED, type: AppointmentType.IN_PERSON, price: 250, reason: "Acompanhamento semanal", notes: "Progresso no controle da ansiedade." },
    { daysOffset: -7,  patientIdx: 4, hour: 15, status: AppointmentStatus.COMPLETED, type: AppointmentType.ONLINE,    price: 220, reason: "Autoestima e identidade", notes: "Sessão produtiva. Tarefas para casa definidas." },
    { daysOffset: -7,  patientIdx: 1, hour: 16, status: AppointmentStatus.COMPLETED, type: AppointmentType.IN_PERSON, price: 250, reason: "Manejo de estresse", notes: "Técnicas de mindfulness apresentadas." },
    { daysOffset: -5,  patientIdx: 2, hour: 10, status: AppointmentStatus.COMPLETED, type: AppointmentType.IN_PERSON, price: 250, reason: "Segunda sessão de avaliação", notes: "Diagnóstico em andamento." },
    { daysOffset: -4,  patientIdx: 3, hour: 14, status: AppointmentStatus.COMPLETED, type: AppointmentType.ONLINE,    price: 220, reason: "Relacionamento interpessoal", notes: "Paciente demonstrou avanços expressivos." },
    { daysOffset: -3,  patientIdx: 0, hour: 9,  status: AppointmentStatus.COMPLETED, type: AppointmentType.IN_PERSON, price: 250, reason: "Acompanhamento", notes: "Paciente relatou semana tranquila." },
    // — Canceladas/Faltou —
    { daysOffset: -6,  patientIdx: 4, hour: 11, status: AppointmentStatus.CANCELLED, type: AppointmentType.ONLINE,    price: 220, reason: "Sessão de autoestima", notes: "Cancelada pela paciente (doença)." },
    // — Hoje —
    { daysOffset: 0,   patientIdx: 0, hour: 9,  status: AppointmentStatus.CONFIRMED, type: AppointmentType.IN_PERSON, price: 250, reason: "Sessão semanal" },
    { daysOffset: 0,   patientIdx: 1, hour: 11, status: AppointmentStatus.CONFIRMED, type: AppointmentType.ONLINE,    price: 220, reason: "Acompanhamento" },
    { daysOffset: 0,   patientIdx: 4, hour: 15, status: AppointmentStatus.PENDING,   type: AppointmentType.IN_PERSON, price: 250, reason: "Sessão de identidade" },
    // — Próximos dias —
    { daysOffset: 1,   patientIdx: 2, hour: 10, status: AppointmentStatus.CONFIRMED, type: AppointmentType.IN_PERSON, price: 250, reason: "Terceira sessão" },
    { daysOffset: 1,   patientIdx: 3, hour: 14, status: AppointmentStatus.PENDING,   type: AppointmentType.ONLINE,    price: 220, reason: "Relacionamento" },
    { daysOffset: 2,   patientIdx: 0, hour: 9,  status: AppointmentStatus.CONFIRMED, type: AppointmentType.IN_PERSON, price: 250, reason: "Acompanhamento quinzenal" },
    { daysOffset: 3,   patientIdx: 1, hour: 10, status: AppointmentStatus.CONFIRMED, type: AppointmentType.IN_PERSON, price: 250, reason: "Sessão de burnout" },
    { daysOffset: 3,   patientIdx: 4, hour: 14, status: AppointmentStatus.PENDING,   type: AppointmentType.ONLINE,    price: 220, reason: "Autoestima" },
    { daysOffset: 5,   patientIdx: 2, hour: 9,  status: AppointmentStatus.PENDING,   type: AppointmentType.IN_PERSON, price: 250, reason: "Avaliação" },
    { daysOffset: 7,   patientIdx: 0, hour: 11, status: AppointmentStatus.PENDING,   type: AppointmentType.IN_PERSON, price: 250, reason: "Sessão semanal" },
    { daysOffset: 7,   patientIdx: 3, hour: 14, status: AppointmentStatus.PENDING,   type: AppointmentType.ONLINE,    price: 220, reason: "Terapia" },
    { daysOffset: 8,   patientIdx: 1, hour: 10, status: AppointmentStatus.PENDING,   type: AppointmentType.IN_PERSON, price: 250, reason: "Acompanhamento" },
    { daysOffset: 10,  patientIdx: 4, hour: 15, status: AppointmentStatus.PENDING,   type: AppointmentType.ONLINE,    price: 220, reason: "Identidade" },
    { daysOffset: 14,  patientIdx: 0, hour: 9,  status: AppointmentStatus.PENDING,   type: AppointmentType.IN_PERSON, price: 250, reason: "Sessão quinzenal" },
  ];

  for (const appt of appointments) {
    const date = new Date(today);
    date.setDate(date.getDate() + appt.daysOffset);

    await prisma.appointment.create({
      data: {
        userId: user.id,
        patientId: patients[appt.patientIdx].id,
        date,
        startTime: `${String(appt.hour).padStart(2, "0")}:00`,
        endTime: `${String(appt.hour).padStart(2, "0")}:50`,
        status: appt.status,
        type: appt.type,
        price: appt.price,
        reason: appt.reason,
        notes: appt.notes,
      },
    });
  }

  console.log(`📅 ${appointments.length} consultas criadas`);

  // ─── Slots de disponibilidade (14 dias à frente) ─────────────────
  let slotCount = 0;
  for (let d = 0; d < 21; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dayOfWeek = date.getDay(); // 0=sun, 6=sat
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    date.setHours(12, 0, 0, 0);

    for (let h = 8; h < 18; h++) {
      await prisma.availabilitySlot.create({
        data: {
          userId: user.id,
          date,
          startTime: `${String(h).padStart(2, "0")}:00`,
          endTime: `${String(h).padStart(2, "0")}:50`,
          isBooked: false,
        },
      });
      slotCount++;
    }
  }

  console.log(`🕐 ${slotCount} horários disponíveis criados`);

  // ─── Avaliações ───────────────────────────────────────────────────
  await prisma.patientReview.createMany({
    data: [
      {
        userId: user.id,
        patientId: maria.id,
        authorName: "Maria Santos",
        authorEmail: "maria.santos@email.com",
        authorCpf: "12345678901",
        rating: 5,
        comment: "A Dra. Ana é incrível! Me ajudou a superar minha ansiedade de forma humanizada e eficaz. Recomendo muito!",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        patientId: joao.id,
        authorName: "João Oliveira",
        authorEmail: "joao.oliveira@email.com",
        authorCpf: "98765432100",
        rating: 5,
        comment: "Profissional excepcional. Ambiente acolhedor e tratamento personalizado. Minha vida mudou desde que comecei.",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        patientId: pedro.id,
        authorName: "Pedro Alves",
        authorEmail: "pedro.alves@email.com",
        authorCpf: "55566677788",
        rating: 4,
        comment: "Ótima profissional, muito atenciosa e competente. As sessões online também funcionam muito bem.",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("⭐ Avaliações criadas");

  // ─── Galeria ──────────────────────────────────────────────────────
  await prisma.profileGalleryImage.createMany({
    data: [
      { userId: user.id, imageUrl: "https://images.unsplash.com/photo-1573497019940-884345b0c469?w=800", caption: "Consultório acolhedor", sortOrder: 0 },
      { userId: user.id, imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800", caption: "Ambiente de atendimento", sortOrder: 1 },
    ],
  });

  // ─── Notificações ─────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: user.id, type: "APPOINTMENT_BOOKED", title: "Nova consulta agendada", message: "Lúcia Ferreira agendou uma consulta para hoje às 15:00", link: "/agenda", read: false },
      { userId: user.id, type: "REMINDER", title: "Consulta em 30 minutos", message: "Você tem uma sessão com João Oliveira às 11:00", link: "/agenda", read: false },
      { userId: user.id, type: "APPOINTMENT_CONFIRMED", title: "Consulta confirmada", message: "Maria Santos confirmou presença para amanhã às 09:00", link: "/agenda", read: true },
      { userId: user.id, type: "REMINDER", title: "Lembrete de agenda", message: "3 consultas agendadas para amanhã", link: "/agenda", read: true },
    ],
  });

  console.log("🔔 Notificações criadas");

  console.log("");
  console.log("============================================");
  console.log("✅ Reset completo!");
  console.log("📧 Email:  demo@clinica.com");
  console.log("🔑 Senha:  demo123456");
  console.log("============================================");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
