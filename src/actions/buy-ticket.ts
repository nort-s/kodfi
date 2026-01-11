"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const buySchema = z.object({
  hotspotId: z.string(),
  offerId: z.string(),
  phone: z.string().min(8, "Numéro invalide"),
});

export async function buyTicket(formData: FormData) {
  // 1. Validation
  const rawData = {
    hotspotId: formData.get("hotspotId"),
    offerId: formData.get("offerId"),
    phone: formData.get("phone"),
  };

  const validation = buySchema.safeParse(rawData);
  if (!validation.success) return { error: "Données invalides" };

  const { hotspotId, offerId, phone } = validation.data;

  try {
    // 2. SIMULATION PAIEMENT (On fait semblant que ça prend 2s)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. TRANSACTION BDD (Atomique)
    // On doit trouver un code LIBRE, le marquer VENDU, et créer la COMMANDE
    // Le tout en une seule opération pour éviter les bugs si 2 personnes achètent en même temps.
    
    return await prisma.$transaction(async (tx) => {
      // a. Trouver un code disponible pour cette offre
      const availableCode = await tx.code.findFirst({
        where: {
          hotspotId,
          offerId, // Important : on veut un code qui correspond au tarif choisi
          status: "AVAILABLE",
        },
      });

      if (!availableCode) {
        throw new Error("Rupture de stock pour cette offre !");
      }

      // b. Créer ou mettre à jour le Client (EndUser)
      let endUser = await tx.endUser.findFirst({ where: { phone } });
      if (!endUser) {
        endUser = await tx.endUser.create({ data: { phone } });
      }

      // c. Créer la commande (Order)
      const order = await tx.order.create({
        data: {
          hotspotId,
          endUserId: endUser.id,
          amount: 0, // Idéalement, on récupère le prix de l'offre ici
          status: "PAID", // On considère que c'est payé
        },
      });

      // d. Marquer le code comme VENDU
      await tx.code.update({
        where: { id: availableCode.id },
        data: {
          status: "SOLD",
          orderId: order.id, // On lie le code à la commande
        },
      });

      // 4. SUCCÈS : On renvoie le code au client
      return { success: true, code: availableCode.code };
    });

  } catch (error: any) {
    console.error("Erreur Achat:", error);
    return { error: error.message || "Erreur lors de l'achat" };
  }
}