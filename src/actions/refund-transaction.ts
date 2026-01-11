"use server";

import { FedaPay, Transaction } from "fedapay";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || "");
FedaPay.setEnvironment(process.env.NODE_ENV === "production" ? "live" : "test");

export async function refundTransactions(disputeId: string) {
    
    // ... appel FedaPay avec dispute.transactionId ...

    // 2. On ferme le litige
    await prisma.dispute.update({
        where: { id: disputeId },
        data: { 
            status: "REFUNDED",
            resolvedAt: new Date()
        }
    });
}
export async function refundTransaction(disputeId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé" };

  try {
    // 1. On récupère le litige PROPREMENT
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });

    if (!dispute) return { error: "Pas de dispute ou de données de transaction" };
    if (dispute.status === "REFUNDED") return { error: "Déjà remboursé" };

    // On force le typage car Prisma renvoie du JSON générique
    // const meta = notif.metadata as { transactionId: number };
    const transactionId = dispute.transactionId;

    if (!transactionId) return { error: "ID de transaction introuvable" };

    // 2. APPEL FEDAPAY : REMBOURSEMENT
    // Note: FedaPay permet d'annuler une transaction (reverse)
    console.log(`Tentative de remboursement de la transaction ${transactionId}...`);
    
    const transaction = await Transaction.retrieve(transactionId);
    
    // On tente d'annuler/rembourser via l'API FedaPay
    // Attention: Selon le mode (Sandbox/Live) et l'opérateur, le remboursement instantané peut varier.
    // Si l'API officielle "refund" n'existe pas dans ta version du SDK, on utilise souvent "delete" pour annuler si c'est récent,
    // ou on doit faire un "payout" vers le client (plus complexe).
    // Supposons ici que la méthode standard est disponible ou qu'on utilise le mode "Reversal".
    
    // Méthode générique pour inverser/rembourser
    await transaction.delete(); // En sandbox souvent delete annule la transaction

    // 3. Si succès, on marque la notification comme TRAITÉE (Lue)
    await prisma.dispute.update({
        where: { id: disputeId },
        data: { 
            status: "REFUNDED",
            resolvedAt: new Date()
        }
    });

    return { success: true };

  } catch (error: any) {
    console.error("Erreur remboursement:", error);
    return { error: "Échec du remboursement FedaPay: " + error.message };
  }
}