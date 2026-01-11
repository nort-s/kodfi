import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CodesClient from "./CodesClient";

export default async function CodesPage() {
  const session = await getServerSession(authOptions);

  // 1. Récupérer les Hotspots (pour le menu déroulant)
  const hotspots = await prisma.hotspot.findMany({
    where: { Owner: { email: session?.user?.email } }
  });

  // 2. Récupérer les Offres (pour le menu déroulant)
  // On filtre celles qui appartiennent aux hotspots du user
  const hotspotIds = hotspots.map(h => h.id);
  const offers = await prisma.offer.findMany({
    where: { hotspotId: { in: hotspotIds } }
  });

  // 3. Récupérer les Codes (pour la liste)
  // On prend juste les 50 derniers ajoutés pour l'aperçu, sinon ça charge trop
  const codes = await prisma.code.findMany({
    where: { hotspotId: { in: hotspotIds } },
    include: {
        Offer: true,
        Hotspot: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  // 4. Nettoyage JSON (Hack Dates)
  const safeHotspots = JSON.parse(JSON.stringify(hotspots));
  const safeOffers = JSON.parse(JSON.stringify(offers));
  const safeCodes = JSON.parse(JSON.stringify(codes));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Gestion des Codes
      </h1>
      
      <CodesClient 
        initialCodes={safeCodes} 
        hotspots={safeHotspots} 
        offers={safeOffers} 
      />
    </div>
  );
}