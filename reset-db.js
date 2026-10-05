const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAll() {
  // Delete all audit logs
  const auditDel = await prisma.auditLog.deleteMany({});
  console.log('AuditLogs deletados:', auditDel.count);

  // Delete all notifications  
  const notifDel = await prisma.notification.deleteMany({});
  console.log('Notifications deletadas:', notifDel.count);

  // Reset all subscriptions
  const subUpdate = await prisma.subscription.updateMany({
    data: { status: 'cancelled', plan: 'free' }
  });
  console.log('Subscriptions resetadas:', subUpdate.count);

  // Clear all landingConfig (site data) from userSettings
  const settings = await prisma.userSettings.findMany({ select: { id: true, landingConfig: true } });
  let cleared = 0;
  for (const s of settings) {
    if (s.landingConfig) {
      await prisma.userSettings.update({
        where: { id: s.id },
        data: { landingConfig: {} }
      });
      cleared++;
    }
  }
  console.log('LandingConfigs limpos:', cleared);

  // Delete all non-admin users and their related data
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  let deleted = 0;
  for (const u of users) {
    if (u.email !== 'anjoslucas962@gmail.com' && u.role !== 'ADMIN') {
      await prisma.subscription.deleteMany({ where: { userId: u.id } });
      await prisma.userSettings.deleteMany({ where: { userId: u.id } });
      await prisma.user.delete({ where: { id: u.id } });
      deleted++;
    }
  }
  console.log('Usuarios nao-admin deletados:', deleted);

  // Also reset admin's own subscription and landing config
  const admin = await prisma.user.findFirst({ where: { email: 'anjoslucas962@gmail.com' } });
  if (admin) {
    await prisma.subscription.updateMany({ 
      where: { userId: admin.id },
      data: { status: 'cancelled', plan: 'free' }
    });
    await prisma.userSettings.updateMany({
      where: { userId: admin.id },
      data: { landingConfig: {} }
    });
    console.log('Admin subscription e landingConfig resetados');
  }

  // List remaining users
  const remaining = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log('Usuarios restantes:', JSON.stringify(remaining, null, 2));

  await prisma.$disconnect();
  console.log('RESET COMPLETO!');
}

resetAll().catch(e => { console.error(e); process.exit(1); });
