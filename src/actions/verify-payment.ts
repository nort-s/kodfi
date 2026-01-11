"use server";

import { FedaPay, Transaction } from "fedapay";
import { prisma } from "@/lib/prisma";

// Configuration de Fedapay avec la clé secrète (Côté Serveur uniquement)
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || "");
// Important : Mettre à 'live' pour la prod, 'test' pour le dev
FedaPay.setEnvironment(process.env.NODE_ENV === "production" ? "live" : "test");

interface VerifyParams {
  transactionId: number; // L'ID que le widget JS nous renvoie
  hotspotId: string;
  offerId: string;
  phone: string;
}

export async function verifyPaymentAndDeliverCode({ transactionId, hotspotId, offerId, phone }: VerifyParams) {

  try {
    console.log("SERVER: Vérification transaction ID:", transactionId); // Log 1
    
    // 1. VÉRIFICATION SÉCURISÉE AUPRÈS DE FEDAPAY
    // On ne fait pas confiance au frontend, on demande à Fedapay le statut réel
    const transaction = await Transaction.retrieve(transactionId);

    console.log("🔍 STATUT FEDAPAY:", transaction.status);
    
    if (transaction.status !== "approved") {
      return { error: "Le paiement n'a pas été approuvé." };
    }

    // 2. LOGIQUE MÉTIER (Comme avant : trouver un code, marquer vendu)
    return await prisma.$transaction(async (tx) => {
    
      // a. Trouver un code disponible
      const availableCode = await tx.code.findFirst({
        where: {
          // hotspotId,
          offerId,
          status: "AVAILABLE",
        },
      });

      console.log("ca a fonctionné: " + availableCode); 


      if (!availableCode) {
        throw new Error("OUT_OF_STOCK");
      }

      // b. Créer/MAJ le client
      let endUser = await tx.endUser.findFirst({ where: { phone } });
      if (!endUser) {
        endUser = await tx.endUser.create({ data: { phone } });
      }

      // c. Enregistrer la commande
      const order = await tx.order.create({
        data: {
          hotspotId,
          endUserId: endUser.id,
          amount: transaction.amount, // On prend le montant réel payé
          status: "PAID",
          payments: {
            create: {
                amount: transaction.amount,
                phone: phone,
                provider: "FEDAPAY",
                status: "PAID",
                transactionId: transactionId.toString()
            }
          }
        },
      });

      // d. Marquer le code comme vendu
      await tx.code.update({
        where: { id: availableCode.id },
        data: {
          status: "SOLD",
          orderId: order.id,
        },
      });

      return { success: true, code: availableCode.code };
    });

  } catch (error: any) {
    console.error("Erreur Vérification Fedapay:", error);

    console.error("ERREUR PAIEMENT:", error);

    // 🚨 4. GESTION DE LA RUPTURE DE STOCK (EN DEHORS DE LA TRANSACTION)
    // Si l'erreur contient notre mot clé, on crée la notif ici.
    if (error.message.includes("OUT_OF_STOCK")) {
      console.log("⚠️ RUPTURE DE STOCK -> OUVERTURE LITIGE");

      const dispute = await prisma.dispute.create({
          data: {
              hotspotId: hotspotId,
              offerId: offerId, // 👈 ICI : On sauvegarde l'offre demandée
              transactionId: transactionId.toString(), // Convertir en string si c'est un number
              amount: 100, // Idéalement le vrai prix de l'offre
              phone: phone,
              status: "OPEN"
          }
      });
        
        console.log("⚠️ Création de la notification de rupture...");
        
        const hotspot = await prisma.hotspot.findUnique({ where: { id: hotspotId } });
    
        if (hotspot) {
            await prisma.notification.create({
                data: {
                    userId: hotspot.ownerId,
                    title: "Rupture de stock critique",
                    message: `Un litige a été ouvert pour le client ${phone}. Vous devez le rembourser.`,
                    type: "ALERT",
                    metadata: { disputeId: dispute.id } 

                }
            });
        }

        return { error: "Stock épuisé. Le gérant a été notifié." };
    }

    return { error: error.message || "Erreur lors de la validation du paiement" };
  }
}