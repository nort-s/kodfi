"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Imagine que tu as une fonction d'envoi SMS
// import { sendSms } from "@/lib/sms"; 

export async function resolveDisputeWithCode(disputeId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé" };

  try {
    return await prisma.$transaction(async (tx) => {
        // 1. Récupérer le litige
        const dispute = await tx.dispute.findUnique({
            where: { id: disputeId },
            include: { Hotspot: true } // On a besoin des infos du hotspot
        });

        if (!dispute) throw new Error("Litige introuvable");
        if (dispute.status !== "OPEN") throw new Error("Ce litige est déjà traité");

        // 2. TROUVER UN CODE DISPONIBLE (Maintenant que le gérant a refait le plein)
        // On cherche un code du même montant/offre. 
        // Note : Si tu n'as pas l'ID de l'offre dans le litige, on prend un code au hasard du hotspot 
        // ou on demande au gérant de sélectionner l'offre manuellement.
        // Pour faire simple ici : on prend n'importe quel code "AVAILABLE" du hotspot.
        
        const code = await tx.code.findFirst({
            where: {
                hotspotId: dispute.hotspotId,
                status: "AVAILABLE",
                offerId: dispute.offerId
            }
        });

        if (!code) {
            throw new Error("Impossible de résoudre : Il n'y a toujours aucun code disponible ! Veuillez d'abord ajouter des tickets.");
        }

        // 3. CRÉER LA COMMANDE (Régularisation)
        let endUser = await tx.endUser.findFirst({ where: { phone: dispute.phone } });
        if (!endUser) endUser = await tx.endUser.create({ data: { phone: dispute.phone } });

        const order = await tx.order.create({
            data: {
                hotspotId: dispute.hotspotId,
                endUserId: endUser.id,
                amount: dispute.amount,
                status: "PAID", // On considère que c'est payé puisqu'il y a litige
            }
        });

        // 4. MARQUER LE CODE COMME VENDU
        await tx.code.update({
            where: { id: code.id },
            data: { status: "SOLD", orderId: order.id }
        });

        // 5. FERMER LE LITIGE
        await tx.dispute.update({
            where: { id: disputeId },
            data: { 
                status: "RESOLVED",
                resolvedAt: new Date(),
                resolutionCode: code.code
            }
        });

        // 6. METTRE À JOUR LA NOTIFICATION (Pour qu'elle disparaisse du dashboard)
        // On cherche la notif liée à ce litige
        // Attention : Prisma ne permet pas de chercher dans le JSON directement facilement avec findFirst sur certains SGBD,
        // mais ici on peut faire un updateMany sur le userId du propriétaire si besoin, 
        // ou mieux : on passe l'ID de la notif depuis le frontend si on l'a.
        
        // Pour l'instant, on laisse le frontend gérer l'état "lu" visuellement, 
        // ou on nettoie les notifs liées à ce litige :
        /* await tx.notification.updateMany({
            where: { metadata: { path: ['disputeId'], equals: disputeId } }, // Syntaxe dépend de la BDD
            data: { isRead: true } 
        });
        */

        // 7. ENVOI SMS (Simulation)
        console.log(`📨 SMS envoyé à ${dispute.phone} : "Votre code Wifi est : ${code.code}. Désolé pour l'attente."`);
        // await sendSms(dispute.phone, `Votre code Wifi Kodfi : ${code.code}`);

        return { success: true, code: code.code, phone: dispute.phone };
    });

  } catch (error: any) {
    console.error("Erreur résolution:", error);
    return { error: error.message };
  }
}