"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const buySchema = z.object({
  hotspotId: z.string(),
  offerId: z.string(),
  phone: z.string().min(8, "Numéro invalide"),
});

export async function buyTicket(formData: FormData) {
  const rawData = {
    hotspotId: formData.get("hotspotId"),
    offerId: formData.get("offerId"),
    phone: formData.get("phone"),
  };

  const validation = buySchema.safeParse(rawData);
  if (!validation.success) return { error: "Données invalides" };

  const { hotspotId, offerId, phone } = validation.data;

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return await prisma.$transaction(async (tx) => {
      // ---------------------------------------------------------
      // 1. RÉCUPÉRATION DES DONNÉES (Config, Offre, Hotspot)
      // ---------------------------------------------------------
      
      // A. Récupérer la configuration globale
      // On utilise l'ID par défaut défini dans ton schema
      const config = await tx.systemConfig.findUnique({
        where: { id: "global_config" }
      });

      // Sécurité : Si la config n'a jamais été initialisée en base
      if (!config) {
        throw new Error("Configuration système manquante. Contactez le support.");
      }

      // B. Récupérer l'offre (pour le PRIX)
      const offer = await tx.offer.findUnique({ where: { id: offerId } });
      if (!offer) throw new Error("Offre invalide ou introuvable.");

      // C. Récupérer le code disponible
      const availableCode = await tx.code.findFirst({
        where: { hotspotId, offerId, status: "AVAILABLE" },
      });

      if (!availableCode) throw new Error("Rupture de stock pour cette offre !");

      // ---------------------------------------------------------
      // 2. CALCULS FINANCIERS (Basés sur SystemConfig)
      // ---------------------------------------------------------
      const amount = offer.price;
      
      // On utilise le taux défini dans ta table SystemConfig (ex: 10.0)
      const commissionRate = config.commissionRate; 
      
      const commissionAmount = (amount * commissionRate) / 100;
      const sellerPart = amount - commissionAmount;

      // ---------------------------------------------------------
      // 3. ENREGISTREMENT (User, Order, Update Code)
      // ---------------------------------------------------------
      
      let endUser = await tx.endUser.findFirst({ where: { phone } });
      if (!endUser) {
        endUser = await tx.endUser.create({ data: { phone } });
      }

      // Création de la commande avec les valeurs calculées dynamiquement
      const order = await tx.order.create({
        data: {
          hotspotId,
          endUserId: endUser.id,
          amount: amount,          
          status: "PAID",
          commissionAmount: commissionAmount, 
          sellerPart: sellerPart,
        },
      });

      await tx.code.update({
        where: { id: availableCode.id },
        data: { status: "SOLD", orderId: order.id },
      });

      return { success: true, code: availableCode.code };
    });

  } catch (error: any) {
    console.error("Erreur Achat:", error);
    return { error: error.message || "Erreur lors de l'achat" };
  }
}