import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'gupta.parth2857@gmail.com';
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    console.log('✅ Admin user updated:', email);
  } else {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        email,
        name: 'Parth Gupta',
        passwordHash: hashedPassword,
        role: 'admin',
      }
    });
    console.log('✅ Admin user created:', email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
