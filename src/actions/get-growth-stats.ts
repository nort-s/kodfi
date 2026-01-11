"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getGrowthStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      clients: { count: 0, rate: 0, status: "neutral" },
      sales: { count: 0, rate: 0, status: "neutral" }
    };
  }

  const userId = session.user.id;

  try {
    // 1. DATES : Définir les bornes temporelles
    const now = new Date();
    
    // Mois Actuel (du 1er à maintenant)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = now; 

    // Mois Précédent (du 1er au dernier jour du mois d'avant)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // 2. RECUPERER LES HOTSPOTS DU USER
    const userHotspots = await prisma.hotspot.findMany({ 
        where: { ownerId: userId }, 
        select: { id: true } 
    });
    const hotspotIds = userHotspots.map(h => h.id);

    if (hotspotIds.length === 0) {
        return {
            clients: { count: 0, rate: 0, status: "neutral" },
            sales: { count: 0, rate: 0, status: "neutral" }
        };
    }

    // --- ANALYSE DES VENTES (TICKETS) ---
    
    // Ventes Mois Actuel
    const currentSalesCount = await prisma.order.count({
        where: {
            hotspotId: { in: hotspotIds },
            status: "PAID",
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd }
        }
    });

    // Ventes Mois Précédent
    const prevSalesCount = await prisma.order.count({
        where: {
            hotspotId: { in: hotspotIds },
            status: "PAID",
            createdAt: { gte: prevMonthStart, lte: prevMonthEnd }
        }
    });

    // --- ANALYSE DES CLIENTS (EndUser uniques) ---
    // On compte combien de personnes distinctes ont acheté

    // Clients Mois Actuel
    const currentClientsRaw = await prisma.order.findMany({
        where: {
            hotspotId: { in: hotspotIds },
            status: "PAID",
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd }
        },
        distinct: ['endUserId'], // La magie Prisma : on ne prend que les IDs uniques
        select: { endUserId: true }
    });
    const currentClientsCount = currentClientsRaw.length;

    // Clients Mois Précédent
    const prevClientsRaw = await prisma.order.findMany({
        where: {
            hotspotId: { in: hotspotIds },
            status: "PAID",
            createdAt: { gte: prevMonthStart, lte: prevMonthEnd }
        },
        distinct: ['endUserId'],
        select: { endUserId: true }
    });
    const prevClientsCount = prevClientsRaw.length;


    // 3. CALCUL DES POURCENTAGES (Helper)
    const calculateRate = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const salesRate = calculateRate(currentSalesCount, prevSalesCount);
    const clientsRate = calculateRate(currentClientsCount, prevClientsCount);

    return {
      clients: {
        count: currentClientsCount,
        rate: salesRate.toFixed(2), // ex: "12.50"
        status: clientsRate >= 0 ? "positive" : "negative",
        rawRate: clientsRate // Pour usage conditionnel si besoin
      },
      sales: {
        count: currentSalesCount,
        rate: salesRate.toFixed(2),
        status: salesRate >= 0 ? "positive" : "negative",
        rawRate: salesRate
      }
    };

  } catch (error) {
    console.error("Erreur Growth Stats:", error);
    return {
        clients: { count: 0, rate: 0, status: "neutral" },
        sales: { count: 0, rate: 0, status: "neutral" }
    };
  }
}