const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { hash } = require('bcryptjs');
// Import du client depuis ton dossier généré
const { PrismaClient } = require('./generated/client'); 

// 👇 COLLE TON URL DE BASE DE DONNÉES ICI ENTRE GUILLEMETS
const connectionString = "postgresql://USER:PASSWORD@localhost:5432/kodfi?schema=public";

if (!connectionString || connectionString.includes("USER:PASSWORD")) {
    console.error("❌ ERREUR : Tu as oublié de mettre la vraie URL dans le fichier seed.js !");
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du seeding (Mode JS)...');

  // 1. ADMIN
  const passwordHash = await hash('admin123', 12);
  const adminEmail = "admin@kodfi.com"; 

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: passwordHash,
      phone: "99999999", // Numéro fictif
    },
  });
  console.log(`👤 Admin prêt : ${admin.email}`);

  // 2. CONFIG
  try {
    await prisma.systemConfig.upsert({
      where: { id: "global_config" },
      update: {},
      create: {
        id: "global_config",
        minPayoutAmount: 2000,
        commissionRate: 10.0,
        arePayoutsEnabled: true,
      }
    });
    console.log(`⚙️ Config système chargée.`);
  } catch (error) {
    console.warn("⚠️ Config ignorée (Probablement des champs manquants).");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });