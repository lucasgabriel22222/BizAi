const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdmin() {
  const result = await prisma.user.updateMany({
    where: { email: 'anjoslucas962@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log('Admin role atualizado:', result.count);
  
  // Also reset the access counter in SystemConfig
  await prisma.systemConfig.upsert({
    where: { id: 'global' },
    create: { id: 'global', proPlanPrice: 39.90 },
    update: {}
  });
  console.log('SystemConfig verificado');
  
  await prisma.$disconnect();
}
fixAdmin().catch(e => { console.error(e); process.exit(1); });
