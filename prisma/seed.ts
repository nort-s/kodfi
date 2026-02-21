import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { PrismaClient } from './generated/client' // Ton chemin
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL

console.log('🌱 Database URL :', connectionString)
if (!connectionString) {
    throw new Error("❌ DATABASE_URL manquant.")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Début du seeding...')

  // 1. ADMIN
  const passwordHash = await hash('admin123', 12)
  const adminEmail = "barnororderic@gmail.com" 

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firstname: "Admin",
      lastname: "System",
      email: adminEmail,
      password: passwordHash,
      phone: "0166325353", // ✅ AJOUTÉ : Numéro fictif obligatoire
      // Si tu as un champ 'role', ajoute-le aussi ici (ex: role: "ADMIN")
      role: "ADMIN",
    },
  })
  console.log(`👤 Admin prêt : ${admin.email}`)

  // 2. CONFIG
  try {
    await prisma.systemConfig.upsert({
      where: { id: "global_config" },
      update: {},
      create: {
        id: "global_config",
        minPayoutAmount: 5000,
        maxPayoutAmount: 100000,
        commissionRate: 10.0,
        arePayoutsEnabled: true,

        // J'ai retiré maxPayoutAmount car il bloquait avant
      }
    })
    console.log(`⚙️ Config système chargée.`)
  } catch (error) {
    console.warn("⚠️ Config ignorée (Champs manquants dans la DB).")
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })