"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { FedaPay, Payout } from "fedapay"; // Assure-toi d'avoir installé: npm install fedapay

// Initialisation FedaPay
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY as string);
// En dev, utilise 'sandbox', en prod met 'live'
FedaPay.setEnvironment(process.env.NODE_ENV === "production" ? "live" : "sandbox");

export async function approvePayout(payoutId: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Action non autorisée." };
  }

  try {
    // 1. Récupérer les infos du retrait en base
    const payoutRequest = await prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payoutRequest || payoutRequest.status !== "PENDING") {
      return { error: "Retrait introuvable ou déjà traité." };
    }

    // 2. CRÉER LE VIREMENT CHEZ FEDAPAY
    // Note: FedaPay appelle ça un "Payout"
    const transaction = await Payout.create({
      amount: payoutRequest.amount, // Le montant NET à envoyer
      currency: { iso: "XOF" },
      mode: "mobile_money",
      customer: {
        firstname: "Vendeur", // Tu peux récupérer le vrai nom via prisma include si tu veux
        lastname: "Kodfi",
        email: "payouts@kodfi.com",
        phone_number: {
          number: payoutRequest.phone,
          country: "bj", // Bénin
        },
      },
    });

    // 3. DÉCLENCHER L'ENVOI IMMÉDIAT
    // Par défaut le payout est créé en "pending", il faut le forcer à partir
    await transaction.sendNow();

    // 4. Mettre à jour la base de données (Succès)
    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
        reference: String(transaction.id), // On stocke l'ID FedaPay pour le suivi
      },
    });

    revalidatePath("/admin/payouts");
    return { success: true };

  } catch (error: any) {
    console.error("Erreur Virement FedaPay:", error);
    
    // Gestion des erreurs fréquentes
    let errorMessage = "Erreur technique lors du virement.";
    if (error.message?.includes("Balance")) errorMessage = "Solde FedaPay insuffisant.";
    if (error.message?.includes("Phone")) errorMessage = "Numéro de téléphone rejeté par l'opérateur.";

    return { error: errorMessage };
  }
}

// Rejeter un retrait (mauvais numéro, suspicion de fraude...)
export async function rejectPayout(payoutId: string, reason: string) {
  const session = await getServerSession(authOptions);
  // TODO: Vérifier Admin

  try {
    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
        rejectionReason: reason,
      },
    });

    revalidatePath("/admin/payouts");
    return { success: true };
  } catch (error) {
    return { error: "Erreur base de données" };
  }
}