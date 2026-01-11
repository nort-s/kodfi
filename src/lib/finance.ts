import { prisma } from "./prisma";

export async function getWalletBalance(userId: string) {
  // 1. Calculer le total des VENTES PAYÉES (L'argent qui est rentré)
  // On regarde tous les hotspots du user -> toutes les commandes -> status "PAID"
  const sales = await prisma.order.aggregate({
    _sum: { amount: true },
    where: {
      Hotspot: { ownerId: userId },
      status: "PAID"
    }
  });

  const totalSales = sales._sum.amount || 0;

  // 2. Calculer le total des RETRAITS (L'argent qui est sorti ou bloqué)
  // On prend tout ce qui est "PENDING" (en attente) ou "PROCESSED" (déjà payé)
  // On ignore les "REJECTED" car l'argent revient dans le solde.
  const payouts = await prisma.payout.aggregate({
    _sum: { amount: true },
    where: {
      userId: userId,
      status: { in: ["PENDING", "PROCESSED"] }
    }
  });

  const totalPayouts = payouts._sum.amount || 0;

  // 3. Calculer ta COMMISSION (Si tu prends un pourcentage)
  // Imaginons 10% de commission pour Kodfi
  const COMMISSION_RATE = 0.10; 
  const totalCommission = Math.floor(totalSales * COMMISSION_RATE);

  // 4. LE SOLDE DISPONIBLE
  const balance = totalSales - totalCommission - totalPayouts;

  return {
    totalSales,
    totalCommission,
    totalPayouts,
    balance: balance > 0 ? balance : 0 // Sécurité anti-négatif
  };
}