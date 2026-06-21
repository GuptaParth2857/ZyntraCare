import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const hospitals = await p.hospital.count();
const doctors = await p.doctor.count();
const users = await p.user.count();
const pharmacies = await p.pharmacy.count();
const labs = await p.lab.count();
console.log({ users, hospitals, doctors, pharmacies, labs });
await p.$disconnect();
