import { PrismaClient, AppointmentStatus, AppointmentType, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo123456", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@clinica.com" },
    update: {},
    create: {
      email: "demo@clinica.com",
      password,
      name: "Dr. Ana Silva",
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
            "Psicóloga clínica com foco em ansiedade, depressão e autoconhecimento. Atendimento humanizado em ambiente acolhedor.",
          yearsExperience: 8,
          education: "Graduação em Psicologia — PUC-SP",
          specializationText: "Especialista em Terapia Cognitivo-Comportamental (TCC)",
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

  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { userId_cpf: { userId: user.id, cpf: "12345678901" } },
      update: {},
      create: {
        userId: user.id,
        name: "Maria Santos",
        cpf: "12345678901",
        phone: "(11) 99999-0001",
        email: "maria@email.com",
        birthDate: new Date("1990-05-15"),
        gender: Gender.FEMALE,
      },
    }),
    prisma.patient.upsert({
      where: { userId_cpf: { userId: user.id, cpf: "98765432100" } },
      update: {},
      create: {
        userId: user.id,
        name: "João Oliveira",
        cpf: "98765432100",
        phone: "(11) 99999-0002",
        email: "joao@email.com",
        birthDate: new Date("1985-08-22"),
        gender: Gender.MALE,
      },
    }),
    prisma.patient.upsert({
      where: { userId_cpf: { userId: user.id, cpf: "11122233344" } },
      update: {},
      create: {
        userId: user.id,
        name: "Carla Mendes",
        cpf: "11122233344",
        phone: "(11) 99999-0003",
        email: "carla@email.com",
        birthDate: new Date("1995-12-03"),
        gender: Gender.FEMALE,
      },
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statuses: AppointmentStatus[] = [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.PENDING,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ];

  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + (i % 7) - 3);
    const patient = patients[i % patients.length];
    const status = statuses[i % statuses.length];

    await prisma.appointment.create({
      data: {
        userId: user.id,
        patientId: patient.id,
        date,
        startTime: `${9 + (i % 6)}:00`,
        endTime: `${9 + (i % 6)}:50`,
        status,
        type: i % 2 === 0 ? AppointmentType.IN_PERSON : AppointmentType.ONLINE,
        price: 250,
        reason: "Acompanhamento psicológico",
        notes: status === AppointmentStatus.COMPLETED ? "Sessão realizada com sucesso" : undefined,
      },
    });
  }

  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    date.setHours(12, 0, 0, 0);
    for (let h = 9; h < 17; h++) {
      await prisma.availabilitySlot.create({
        data: {
          userId: user.id,
          date,
          startTime: `${String(h).padStart(2, "0")}:00`,
          endTime: `${String(h).padStart(2, "0")}:50`,
          isBooked: false,
        },
      });
    }
  }

  await prisma.profileGalleryImage.createMany({
    data: [
      {
        userId: user.id,
        imageUrl: "https://images.unsplash.com/photo-1573497019940-884345b0c469?w=800",
        caption: "Consultório acolhedor",
        sortOrder: 0,
      },
      {
        userId: user.id,
        imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
        caption: "Ambiente de atendimento",
        sortOrder: 1,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: "APPOINTMENT_BOOKED",
        title: "Nova consulta agendada",
        message: "Maria Santos agendou uma consulta para amanhã às 10:00",
        link: "/agenda",
      },
      {
        userId: user.id,
        type: "REMINDER",
        title: "Lembrete de consulta",
        message: "Você tem uma consulta em 30 minutos com João Oliveira",
        link: "/agenda",
      },
    ],
  });

  console.log("Seed concluído! Login: demo@clinica.com / demo123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
