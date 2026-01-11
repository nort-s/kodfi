"use server";

import { prisma } from "@/lib/prisma";

export async function checkOfferStock(offerId: string) {
  try {
    const count = await prisma.code.count({
      where: {
        offerId: offerId,
        status: "AVAILABLE", // On ne compte que les codes libres
      },
    });

    return { 
      isAvailable: count > 0, 
      remaining: count 
    };
  } catch (error) {
    console.error("Erreur stock:", error);
    // Par sécurité, en cas d'erreur technique, on bloque la vente
    return { isAvailable: false, remaining: 0 };
  }
}