const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { email: true, phone: true } })
  .then(r => console.log(r))
  .finally(() => p.$disconnect());