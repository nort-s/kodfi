import { PrismaClient, Role, Hotspot, Offer, Code, Order, EndUser } from '../../prisma/generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 1. Create the native database connection pool
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })

// 2. Create the Prisma Driver Adapter
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { Role };
export { type Hotspot, type Offer, type Code, type Order, type EndUser };
export { PrismaClient };