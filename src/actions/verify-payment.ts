"use server";

import { FedaPay, Transaction } from "fedapay";
import { prisma } from "@/lib/prisma";

FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || "");
FedaPay.setEnvironment(process.env.NODE_ENV === "production" ? "live" : "test");

interface VerifyParams {
  transactionId: number;
  hotspotId: string;
  offerId: string;
  phone: string;
}

export async function verifyPaymentAndDeliverCode({ transactionId, hotspotId, offerId, phone }: VerifyParams) {

  // 1. On récupère la config pour le taux de commission (GLOBAL)
  // On le fait en dehors du try/catch pour l'avoir dispo partout
  const config = await prisma.systemConfig.findUnique({ where: { id: "global_config" } });
  const commissionRate = config?.commissionRate || 10.0;
  
  // On déclare ces variables ici pour qu'elles soient accessibles dans le CATCH en cas d'erreur
  let realAmount = 0; 

  try {
    console.log("SERVER: Vérification transaction ID:", transactionId);
    
    // 2. VÉRIFICATION FEDAPAY
    const transaction = await Transaction.retrieve(transactionId);
    console.log("🔍 STATUT FEDAPAY:", transaction.status);
    
    if (transaction.status !== "approved") {
      return { error: "Le paiement n'a pas été approuvé." };
    }

    realAmount = transaction.amount; // On sauvegarde le vrai montant payé

    // 3. LOGIQUE MÉTIER
    return await prisma.$transaction(async (tx) => {
    
      // a. Trouver un code
      const availableCode = await tx.code.findFirst({
        where: {
          offerId, // Important de filtrer par offre pour donner le bon type de temps
          status: "AVAILABLE",
        },
      });

      if (!availableCode) {
        throw new Error("OUT_OF_STOCK");
      }

      // b. Créer/MAJ le client
      let endUser = await tx.endUser.findFirst({ where: { phone } });
      if (!endUser) {
        endUser = await tx.endUser.create({ data: { phone } });
      }

      // --- CALCUL DE LA RÉPARTITION (Le fix est ici) ---
      const commissionAmount = Math.floor(realAmount * (commissionRate / 100));
      const sellerPart = realAmount - commissionAmount;
      // ------------------------------------------------

      // c. Enregistrer la commande
      const order = await tx.order.create({
        data: {
          hotspotId,
          endUserId: endUser.id,
          amount: realAmount,
          status: "PAID",
          
          // --- AJOUTS OBLIGATOIRES ---
          commissionAmount,
          sellerPart,
          // ---------------------------

          payments: {
            create: {
                amount: realAmount,
                phone: phone,
                provider: "FEDAPAY",
                status: "PAID",
                transactionId: transactionId.toString()
            }
          }
        },
      });

      // d. Marquer le code vendu
      await tx.code.update({
        where: { id: availableCode.id },
        data: { status: "SOLD", orderId: order.id },
      });

      return { success: true, code: availableCode.code };
    });

  } catch (error: any) {
    console.error("ERREUR PAIEMENT:", error);

    // 🚨 GESTION RUPTURE DE STOCK
    if (error.message.includes("OUT_OF_STOCK")) {
      console.log("⚠️ RUPTURE DE STOCK -> OUVERTURE LITIGE");

      // Si realAmount est 0 (ex: erreur avant retrieve), on essaie de récupérer le prix de l'offre
      // Mais normalement, si on est là, c'est que FedaPay a répondu.
      let disputeAmount = realAmount;
      if (disputeAmount === 0) {
         // Fallback de sécurité : on cherche le prix de l'offre
         const offer = await prisma.offer.findUnique({ where: { id: offerId }});
         disputeAmount = offer?.price || 0;
      }

      const dispute = await prisma.dispute.create({
          data: {
              hotspotId: hotspotId,
              offerId: offerId,
              transactionId: transactionId.toString(),
              amount: disputeAmount, // On utilise le vrai montant ici !
              phone: phone,
              status: "OPEN"
          }
      });
        
      // Notification
      const hotspot = await prisma.hotspot.findUnique({ where: { id: hotspotId } });
      if (hotspot) {
          await prisma.notification.create({
              data: {
                  userId: hotspot.ownerId,
                  title: "Rupture de stock critique 🚨",
                  message: `Le client ${phone} a payé ${disputeAmount}F mais aucun code n'était dispo. Un litige a été ouvert.`,
                  type: "ALERT",
                  metadata: { disputeId: dispute.id } 
              }
          });
      }

      return { error: "Stock épuisé. Votre paiement est sécurisé, le gérant a été notifié." };
    }

    return { error: error.message || "Erreur technique lors de la validation" };
  }
}