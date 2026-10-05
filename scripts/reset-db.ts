import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("Iniciando reset completo do banco de dados...");

  try {
    // Apaga tabelas dependentes primeiro para evitar erro de Foreign Key
    await prisma.patientReview.deleteMany({});
    console.log("✓ PatientReviews limpos");

    await prisma.appointment.deleteMany({});
    console.log("✓ Appointments limpos");

    await prisma.availabilitySlot.deleteMany({});
    console.log("✓ AvailabilitySlots limpos");

    await prisma.break.deleteMany({});
    console.log("✓ Breaks limpos");

    await prisma.patient.deleteMany({});
    console.log("✓ Patients limpos");

    await prisma.notification.deleteMany({});
    console.log("✓ Notifications limpas");

    await prisma.profileGalleryImage.deleteMany({});
    console.log("✓ ProfileGalleryImages limpas");

    await prisma.subscription.deleteMany({});
    console.log("✓ Subscriptions limpas");

    await prisma.whatsAppConnection.deleteMany({});
    console.log("✓ WhatsAppConnections limpas");

    await prisma.aIAssistant.deleteMany({});
    console.log("✓ AIAssistants limpos");

    await prisma.customDomain.deleteMany({});
    console.log("✓ CustomDomains limpos");

    await prisma.automationSettings.deleteMany({});
    console.log("✓ AutomationSettings limpas");

    await prisma.userSettings.deleteMany({});
    console.log("✓ UserSettings limpas");

    // Limpa a tabela genérica de landingConfig se existir
    try {
      if ((prisma as any).landingConfig) {
        await (prisma as any).landingConfig.deleteMany({});
        console.log("✓ LandingConfigs limpos");
      }
    } catch {
      // ignora
    }

    // Apaga os usuários
    await prisma.user.deleteMany({});
    console.log("✓ Usuários limpos");

    console.log("🎉 Reset concluído com sucesso! O sistema está pronto para novos cadastros e testes.");
  } catch (error) {
    console.error("Erro ao resetar o banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
