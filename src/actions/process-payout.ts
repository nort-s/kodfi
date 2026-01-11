"use server";

import { FedaPay, Payout } from "fedapay"; // Attention: Vérifie que Payout existe dans ton SDK, sinon 'Transaction' type 'payout'
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Configurer FedaPay
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || "");
FedaPay.setEnvironment(process.env.NODE_ENV === "production" ? "live" : "test");

export async function processPayoutAdmin(payoutId: string) {
  const session = await getServerSession(authOptions);
  
  // 1. SÉCURITÉ ADMIN
  // Remplace par ton email exact pour être le seul à pouvoir valider
  if (session?.user?.email !== "ton_email_admin@gmail.com") {
      return { error: "Accès refusé. Réservé à l'administrateur." };
  }

  try {
    // 2. Récupérer la demande en base
    const payoutRequest = await prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payoutRequest) return { error: "Demande introuvable" };
    if (payoutRequest.status !== "PENDING") return { error: "Cette demande a déjà été traitée" };

    // 3. MAPPER LE RÉSEAU (MTN/MOOV) POUR FEDAPAY
    // FedaPay attend des codes précis comme 'mtn', 'moov', 'celtiis'
    let mode = "";
    if (payoutRequest.network === "MTN") mode = "mtn";
    else if (payoutRequest.network === "MOOV") mode = "moov";
    else if (payoutRequest.network === "CELTIIS") mode = "celtiis";
    else return { error: "Réseau non supporté" };

    // 4. APPEL API FEDAPAY : ENVOYER L'ARGENT 💸
    // Note : La syntaxe peut varier légèrement selon la version du SDK FedaPay.
    // Voici la structure standard pour un "Payout" (Dépôt)
    console.log(`Envoi de ${payoutRequest.amount} vers ${payoutRequest.phone} via ${mode}...`);

    const fedaPayout = await Payout.create({
      currency: { iso: "XOF" },
      amount: payoutRequest.amount,
      mode: mode,
      recipient: {
        number: payoutRequest.phone,
        country: "bj" // Bénin
      },
      description: `Retrait Kodfi - ${session.user.email}` // Libellé
    });

    // 5. ATTENTION : FedaPay peut mettre le payout en "pending" côté API aussi.
    // Idéalement, on attend la confirmation, mais ici on marque comme traité.
    // L'objet 'fedaPayout' contient l'ID de transaction FedaPay.
    
    // 6. METTRE À JOUR LA DB
    await prisma.payout.update({
        where: { id: payoutId },
        data: { 
            status: "PROCESSED", 
            processedAt: new Date(),
            reference: fedaPayout.id.toString() // On garde la preuve FedaPay
        }
    });

    return { success: true, ref: fedaPayout.id };

  } catch (error: any) {
    console.error("Erreur FedaPay Payout:", error);
    return { error: "Échec du virement API : " + (error.message || error) };
  }
}