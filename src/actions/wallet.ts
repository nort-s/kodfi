"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getWalletData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non connecté" };

  const userId = session.user.id;

  try {
    // 1. Config Globale (pour le seuil de retrait)
    const config = await prisma.systemConfig.findUnique({ where: { id: "global_config" } });
    const minPayout = config?.minPayoutAmount || 2000;
    const commissionRate = config?.commissionRate || 10.0;

    // 2. Calculer le total des ventes (PAID) via les hotspots du user
    // On récupère les hotspots du user d'abord
    const userHotspots = await prisma.hotspot.findMany({ where: { ownerId: userId }, select: { id: true } });
    const hotspotIds = userHotspots.map(h => h.id);

    const salesAgg = await prisma.order.aggregate({
      where: { hotspotId: { in: hotspotIds }, status: "PAID" },
      _sum: { amount: true },
    });
    const totalSalesRaw = salesAgg._sum.amount || 0;
    
    // Application de la commission (Ce que le provider gagne réellement)
    const totalEarned = Math.floor(totalSalesRaw * (1 - (commissionRate / 100)));

    // 3. Calculer ce qui a déjà été retiré ou est en attente
    const payoutsAgg = await prisma.payout.aggregate({
      where: { 
        userId: userId, 
        status: { in: ["PENDING", "PROCESSED"] } // On compte les demandes en cours comme "déjà sorties" du solde dispo
      },
      _sum: { amount: true },
    });
    const totalWithdrawn = payoutsAgg._sum.amount || 0;

    // 4. Calcul du solde disponible
    const balance = totalEarned - totalWithdrawn;
    const canWithdraw = balance >= minPayout;

    return {
      totalSalesRaw,    // Chiffre d'affaire brut
      totalEarned,      // Net après commission
      totalWithdrawn,
      balance,          // Ce qu'il peut retirer
      minPayout,
      canWithdraw
    };

  } catch (error) {
    console.error("Wallet Error", error);
    return { error: "Erreur calcul portefeuille" };
  }
}