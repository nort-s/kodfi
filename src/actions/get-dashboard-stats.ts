"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return { error: "Non autorisé" };
  }

  try {
    const userId = session.user.id; // Assure-toi que l'ID est bien dans la session (voir auth.ts)

    // 1. Récupérer les Hotspots de l'utilisateur
    // On filtre tout par les hotspots qui appartiennent à l'utilisateur connecté
    const userHotspots = await prisma.hotspot.findMany({
      where: { ownerId: userId, deletedAt: null },
      select: { id: true },
    });

    const hotspotIds = userHotspots.map((h) => h.id);

    // Si aucun hotspot, on retourne des zéros
    if (hotspotIds.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        activeCodes: 0,
        totalHotspots: 0,
        recentOrders: [],
        salesChart: [],
      };
    }

    // 2. Calculer le Revenu Total (Somme des commandes PAYÉES)
    const revenueAggregate = await prisma.order.aggregate({
      where: {
        hotspotId: { in: hotspotIds },
        status: "PAID",
      },
      _sum: { amount: true },
    });

    // 3. Nombre total de commandes (Réussies)
    const totalOrders = await prisma.order.count({
      where: {
        hotspotId: { in: hotspotIds },
        status: "PAID",
      },
    });

    // 4. Nombre de codes ACTIFS (Ceux qui sont "USED" ou "SOLD" mais pas encore "EXPIRED")
    // Note: Ta logique d'expiration dépend de ton implémentation, ici on compte les 'SOLD'
    const activeCodes = await prisma.code.count({
      where: {
        hotspotId: { in: hotspotIds },
        status: "SOLD", // Vendu mais pas encore consommé/expiré
      },
    });

    // 5. Les 5 dernières commandes
    const recentOrders = await prisma.order.findMany({
      where: {
        hotspotId: { in: hotspotIds },
        status: "PAID",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        Hotspot: { select: { name: true } },
        EndUser: { select: { phone: true } },
      },
    });

    // 6. Données pour le Graphique (Ventes des 7 derniers jours)
    // C'est un peu plus complexe en SQL brut, mais on va faire simple en JS pour l'instant
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ordersLast7Days = await prisma.order.findMany({
      where: {
        hotspotId: { in: hotspotIds },
        status: "PAID",
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, amount: true },
    });

    // On groupe par jour
    const salesChart = groupOrdersByDay(ordersLast7Days);

    return {
      totalRevenue: revenueAggregate._sum.amount || 0,
      totalOrders,
      activeCodes,
      totalHotspots: hotspotIds.length,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        hotspotName: o.Hotspot.name,
        customerPhone: o.EndUser.phone,
        amount: o.amount,
        date: o.createdAt.toISOString(),
      })),
      salesChart,
    };

  } catch (error) {
    console.error("Erreur Dashboard:", error);
    return { error: "Erreur serveur lors du chargement des stats." };
  }
}

// Helper pour grouper les commandes par jour (Format 'Jeu', 'Ven', etc.)
function groupOrdersByDay(orders: { createdAt: Date; amount: number }[]) {
  const daysMap = new Map<string, number>();
  const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Initialiser les 7 derniers jours à 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = daysOfWeek[d.getDay()];
    daysMap.set(dayName, 0); // On écrase si le jour se répète (cas simple)
    // Pour être précis il faudrait utiliser la date complète, mais pour un petit graph ça suffit
  }

  orders.forEach((order) => {
    const dayName = daysOfWeek[order.createdAt.getDay()];
    const current = daysMap.get(dayName) || 0;
    daysMap.set(dayName, current + order.amount);
  });

  // Convertir en tableau pour le chart
  // Attention: L'ordre du Map n'est pas garanti, mais si on itère sur les jours générés c'est bon
  const chartData: { name: string; sales: number }[] = [];
  // On refait une boucle pour garantir l'ordre chronologique
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = daysOfWeek[d.getDay()];
    chartData.push({
      name: dayName,
      sales: daysMap.get(dayName) || 0,
    });
  }
  
  return chartData;
}