const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rudransh.dev' },
    update: {},
    create: {
      email: 'admin@rudransh.dev',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('Created admin user:', admin.email)
  console.log('Password: admin123')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

