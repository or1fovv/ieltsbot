import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const count = await p.dailyTopic.count();
console.log('Daily Topics count in DB:', count);
await p.$disconnect();
