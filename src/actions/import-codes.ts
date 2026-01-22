"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma"; // Vérifie que tu importes aussi l'enum CodeStatus si besoin
import { z } from "zod";
import { revalidatePath } from "next/cache";

const importSchema = z.object({
  hotspotId: z.string(),
  offerId: z.string().min(1, "Veuillez sélectionner une offre"),
  rawCodes: z.string().min(5, "Collez au moins un code"),
});

export async function importCodes(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Non autorisé" };

  const validation = importSchema.safeParse({
    hotspotId: formData.get("hotspotId"),
    offerId: formData.get("offerId"), // On lie à l'ID de l'offre, pas juste un nom
    rawCodes: formData.get("rawCodes"),
  });

  if (!validation.success) return { error: "Données invalides" };

  const { hotspotId, offerId, rawCodes } = validation.data;

  // Vérification propriétaire
  const hotspot = await prisma.hotspot.findUnique({ where: { id: hotspotId } });
  if (!hotspot || hotspot.ownerId !== session.user.id) return { error: "Interdit" };

  // Traitement du texte
  const codesArray = rawCodes
    .split(/[\n,]+/) // Sépare par ligne ou virgule
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (codesArray.length === 0) return { error: "Aucun code détecté" };

  try {
    // createMany est super performant pour ça
    const result = await prisma.code.createMany({
      data: codesArray.map((code) => ({
        code,
        hotspotId,
        offerId,
        status: "AVAILABLE", // Utilise ton Enum CodeStatus
      })),
      skipDuplicates: true, // Génial : ignore les doublons sans planter !
    });

    revalidatePath("/admin/dashboard/hotspots");
    return { success: true, count: result.count };
  } catch (error) {
    console.error(error);
    return { error: "Erreur BDD" };
  }
}