"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getBestSellingOffers(days: number = 1) { // 1 = 24h
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const userId = session.user.id;
  
  // Date de début
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // 1. Récupérer les hotspots du user
    const userHotspots = await prisma.hotspot.findMany({ where: { ownerId: userId }, select: { id: true } });
    const hotspotIds = userHotspots.map(h => h.id);

    // 2. Grouper les commandes payées par Code -> OfferId
    // Attention: Prisma ne permet pas de "join" facile dans un groupBy.
    // On va procéder autrement : Trouver les offres et compter les codes vendus liés.

    const offers = await prisma.offer.findMany({
      where: { hotspotId: { in: hotspotIds } },
      select: {
        id: true,
        name: true,
        price: true,
        _count: {
            select: { 
                codes: { 
                    where: { 
                        status: "SOLD",
                        updatedAt: { gte: startDate } // La date de vente correspond à updatedAt quand status passe à SOLD
                    } 
                } 
            }
        }
      }
    });

    // Formatter pour le graph
    const chartData = offers
        .map(o => ({
            name: o.name,
            sales: o._count.codes, // Nombre de ventes
            revenue: o._count.codes * o.price // Chiffre d'affaires
        }))
        .filter(item => item.sales > 0) // On garde que ceux qui ont vendu
        .sort((a, b) => b.sales - a.sales) // Trier par ventes
        .slice(0, 5); // Top 5

    return chartData;

  } catch (error) {
    console.error(error);
    return [];
  }
}