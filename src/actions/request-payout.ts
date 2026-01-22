"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { compare } from "bcryptjs";
import { normalizeBeninPhone, getBeninOperator } from "@/lib/phone-utils";

interface PayoutRequest {
  amount: number;
  phone: string;
  password: string;
}

export async function requestPayout({ amount, phone, password }: PayoutRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Non autorisé" };

  try {
    // 1. VALIDATION FORMAT TÉLÉPHONE (Ajout de ma logique ici)
    const cleanPhone = normalizeBeninPhone(phone);
    if (!cleanPhone) {
      return { error: "Numéro de téléphone invalide." };
    }
    const network = getBeninOperator(cleanPhone); // On détecte le réseau auto
    if (network === "UNKNOWN") {
      return { error: "Opérateur non reconnu (MTN, Moov, Celtiis uniquement)." };
    }

    // 2. Récupérer le user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true }
    });

    if (!user || !user.password) return { error: "Compte invalide." };

    // 3. VÉRIFIER LE MOT DE PASSE
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return { error: "Mot de passe incorrect." };
    }

    // 4. CONFIG SYSTÈME
    const config = await prisma.systemConfig.findUnique({ where: { id: "global_config" } })
      || { minPayoutAmount: 5000, arePayoutsEnabled: true, commissionRate: 10.0 };

    if (!config.arePayoutsEnabled) return { error: "Retraits suspendus temporairement." };
    if (amount < config.minPayoutAmount) return { error: `Minimum : ${config.minPayoutAmount} FCFA` };

    // 5. TRANSACTION ATOMIQUE
    return await prisma.$transaction(async (tx) => {

      // A. Vérifier les litiges
      const openDisputes = await tx.dispute.count({
        where: { Hotspot: { ownerId: user.id }, status: "OPEN" }
      });
      if (openDisputes > 0) throw new Error(`Vous avez ${openDisputes} litige(s) en cours. Retrait bloqué.`);

      // B. Recalculer le solde
      const netEarnings = await tx.order.aggregate({
        _sum: { sellerPart: true }, // Utilise la colonne sellerPart du nouveau schéma
        where: { Hotspot: { ownerId: user.id }, status: "PAID" }
      });

      // B. Somme des retraits (on ne change rien ici)
      const payouts = await tx.payout.aggregate({
        _sum: { amount: true },
        where: { userId: user.id, status: { in: ["PENDING", "PROCESSED"] } }
      });

      const earnings = netEarnings._sum.sellerPart || 0;
      const totalPayouts = payouts._sum.amount || 0;

      // Le solde est direct maintenant
      const currentBalance = earnings - totalPayouts;

      if (amount > currentBalance) {
        throw new Error(`Solde insuffisant. Disponible : ${currentBalance} FCFA`);
      }

      let estimatedFee = 150;
      if (amount > 10000) estimatedFee = 300;
      if (amount > 50000) estimatedFee = 800;

      // C. Créer le retrait
      await tx.payout.create({
        data: {
          userId: user.id,
          amount,         // Ce que le vendeur reçoit
          fee: estimatedFee, // Ce que TOI tu payes à FedaPay
          totalCost: amount + estimatedFee, // Sortie totale de ton compte FedaPay
          phone: cleanPhone,
          network,
          status: "PENDING"
        }
      });

      return { success: true };
    });

  } catch (error: any) {
    console.error("Erreur Payout:", error);
    return { error: error.message || "Erreur technique." };
  }
}