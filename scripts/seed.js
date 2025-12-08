const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Define new admin credentials
  const newAdminEmail = 'rudranshdevelopment@gmail.com'
  const newAdminPassword = 'Vivek@142003'
  const existingAdminEmails = [
    'admin@example.com',
    'admin@rudransh.dev',
    'admin@rudranshdevelopment.com'
  ]

  // First, find all admin users
  const allAdmins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { email: true },
  })

  console.log(`Found ${allAdmins.length} admin user(s)`)

  // Create/Update new admin user first (so we can transfer tests)
  const hashedPassword = await bcrypt.hash(newAdminPassword, 10)
  
  // Check if new admin already exists
  let newAdminId = null
  const existingNewAdmin = await prisma.user.findUnique({
    where: { email: newAdminEmail },
  })
  
  if (existingNewAdmin) {
    // Update existing user
    const updatedAdmin = await prisma.user.update({
      where: { email: newAdminEmail },
      data: {
        name: 'Vivek',
        password: hashedPassword,
        role: 'admin',
      },
    })
    newAdminId = updatedAdmin.id
    console.log('Updated admin user:', updatedAdmin.email)
  } else {
    // Create new user
    const admin = await prisma.user.create({
      data: {
        email: newAdminEmail,
        name: 'Vivek',
        password: hashedPassword,
        role: 'admin',
      },
    })
    newAdminId = admin.id
    console.log('Created admin user:', admin.email)
  }

  // Now transfer tests from old admins to new admin, then delete old admins
  for (const admin of allAdmins) {
    if (admin.email !== newAdminEmail && existingAdminEmails.includes(admin.email)) {
      try {
        // Get the old admin's ID
        const oldAdmin = await prisma.user.findUnique({
          where: { email: admin.email },
          select: { id: true },
        })
        
        if (oldAdmin) {
          // Transfer all tests created by old admin to new admin
          const testsTransferred = await prisma.test.updateMany({
            where: { createdBy: oldAdmin.id },
            data: { createdBy: newAdminId },
          })
          
          if (testsTransferred.count > 0) {
            console.log(`Transferred ${testsTransferred.count} test(s) from ${admin.email} to new admin`)
          }
          
          // Now delete the old admin
          await prisma.user.delete({
            where: { email: admin.email },
          })
          console.log(`Deleted existing admin user: ${admin.email}`)
        }
      } catch (error) {
        console.error(`Error deleting ${admin.email}:`, error.message)
      }
    }
  }

  console.log(`Email: ${newAdminEmail}`)
  console.log(`Password: ${newAdminPassword}`)
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

