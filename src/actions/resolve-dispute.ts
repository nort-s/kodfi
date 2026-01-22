"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function resolveDisputeWithCode(disputeId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé" };

  // 1. On récupère le taux de commission actuel
  const config = await prisma.systemConfig.findUnique({ 
    where: { id: "global_config" } 
  });
  const commissionRate = config?.commissionRate || 10.0;

  try {
    return await prisma.$transaction(async (tx) => {
        // A. Récupérer le litige
        const dispute = await tx.dispute.findUnique({
            where: { id: disputeId },
            include: { Hotspot: true } 
        });

        if (!dispute) throw new Error("Litige introuvable");
        if (dispute.status !== "OPEN") throw new Error("Ce litige est déjà traité");

        // B. TROUVER UN CODE DISPONIBLE
        const code = await tx.code.findFirst({
            where: {
                hotspotId: dispute.hotspotId,
                status: "AVAILABLE",
                offerId: dispute.offerId // Idéalement, on filtre par la même offre
            }
        });

        if (!code) {
            throw new Error("Impossible de résoudre : Aucun code disponible pour cette offre.");
        }

        // --- CALCUL DE LA RÉPARTITION (Le fix est ici) ---
        // On se base sur le montant du litige (ce que le client a payé)
        const commissionAmount = Math.floor(dispute.amount * (commissionRate / 100));
        const sellerPart = dispute.amount - commissionAmount;
        // ------------------------------------------------

        // C. CRÉER LA COMMANDE (Régularisation)
        let endUser = await tx.endUser.findFirst({ where: { phone: dispute.phone } });
        if (!endUser) endUser = await tx.endUser.create({ data: { phone: dispute.phone } });

        const order = await tx.order.create({
            data: {
                hotspotId: dispute.hotspotId,
                endUserId: endUser.id,
                amount: dispute.amount,
                status: "PAID",
                
                // --- AJOUTS OBLIGATOIRES ---
                commissionAmount: commissionAmount,
                sellerPart: sellerPart,
                // ---------------------------
            }
        });

        // D. MARQUER LE CODE COMME VENDU
        await tx.code.update({
            where: { id: code.id },
            data: { status: "SOLD", orderId: order.id }
        });

        // E. FERMER LE LITIGE
        await tx.dispute.update({
            where: { id: disputeId },
            data: { 
                status: "RESOLVED",
                resolvedAt: new Date(),
                resolutionCode: code.code
            }
        });

        console.log(`✅ Litige résolu pour ${dispute.phone} avec le code ${code.code}`);

        return { success: true, code: code.code, phone: dispute.phone };
    });

  } catch (error: any) {
    console.error("Erreur résolution:", error);
    return { error: error.message };
  }
}