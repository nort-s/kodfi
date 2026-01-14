"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const offerSchema = z.object({
  hotspotId: z.string(),
  name: z.string().min(1, "Nom requis (ex: 1 Heure)"),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  duration: z.coerce.number().min(1, "Durée en minutes requise"), 
  unit: z.enum(["MINUTES", "HOURS", "DAYS", "MONTHS"]),
});

export async function createOffer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Non autorisé" };

  const rawData = {
    hotspotId: formData.get("hotspotId"),
    name: formData.get("name"),
    price: formData.get("price"),
    duration: formData.get("duration"),
    unit: formData.get("unit"),
  };

  const validation = offerSchema.safeParse(rawData);
  if (!validation.success) {
    console.log(validation.error.format());
    return { error: "Données invalides" }
  };

  const { hotspotId, name, price, duration, unit } = validation.data;

  // Sécurité : Vérifier que le hotspot appartient au user
  const hotspot = await prisma.hotspot.findUnique({
    where: { id: hotspotId },
  });

  if (!hotspot || hotspot.ownerId !== session.user.id) {
    return { error: "Accès refusé au hotspot" };
  }

  try {
    await prisma.offer.create({
      data: {
        name,
        price,
        duration, // On stocke en minutes (assure-toi que c'est cohérent avec ton besoin)
        unit,
        hotspotId,
      },
    });

    revalidatePath("/dashboard/hotspots");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la création de l'offre" };
  }
}