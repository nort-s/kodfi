"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getTransactionHistory() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  try {
    // 1. Récupérer la config pour le taux de commission (ou valeur par défaut)
    const config = await prisma.systemConfig.findUnique({ where: { id: "global_config" } });
    const commissionRate = config?.commissionRate || 10.0;

    // 2. Récupérer les Ventes (ENTRÉES)
    // On doit d'abord trouver les hotspots du user
    const userHotspots = await prisma.hotspot.findMany({ where: { ownerId: userId }, select: { id: true } });
    const hotspotIds = userHotspots.map(h => h.id);

    const orders = await prisma.order.findMany({
      where: { 
        hotspotId: { in: hotspotIds },
        status: "PAID"
      },
      select: { id: true, amount: true, createdAt: true, code: { select: { code: true } } },
      orderBy: { createdAt: "desc" },
      take: 50 // On limite aux 50 dernières pour ne pas exploser la page
    });

    // 3. Récupérer les Retraits (SORTIES)
    const payouts = await prisma.payout.findMany({
      where: { userId: userId },
      select: { id: true, amount: true, createdAt: true, status: true, network: true },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    // 4. FUSIONNER ET NORMALISER
    const transactions = [
      // Formatage des Ventes
      ...orders.map(order => {
        const netAmount = Math.floor(order.amount * (1 - (commissionRate / 100)));
        return {
          id: order.id,
          type: "CREDIT", // Argent qui rentre
          label: `Vente Ticket WiFi`,
          details: order.code?.code || "Code direct",
          amount: netAmount, // Montant NET (ce qu'il gagne vraiment)
          rawAmount: order.amount, // Montant BRUT (ce que le client a payé)
          date: order.createdAt,
          status: "COMPLETED"
        };
      }),
      // Formatage des Retraits
      ...payouts.map(payout => ({
        id: payout.id,
        type: "DEBIT", // Argent qui sort
        label: `Retrait vers ${payout.network}`,
        details: "Virement Mobile Money",
        amount: payout.amount,
        rawAmount: payout.amount,
        date: payout.createdAt,
        status: payout.status
      }))
    ];

    // 5. TRI FINAL (Du plus récent au plus vieux)
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  } catch (error) {
    console.error("Erreur Transactions:", error);
    return [];
  }
}