import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"; // Version Auth v4
import { authOptions } from "@/lib/auth";
import OffersClient from "./OffersClient";
import { redirect } from "next/navigation";


export default async function OffersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) { return redirect("/signin"); }
  
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email || undefined },
    select: { id: true } // On veut juste son ID
  });
  
  if (!dbUser) { return redirect("/signin"); }

  // 1. Récupérer les offres existantes (avec le nom du hotspot associé)
  const offers = await prisma.offer.findMany({
    where: { 
        Hotspot: { 
            ownerId: dbUser.id
        } // Sécurité basique si pas loggé
        // Note: L'idéal est de filtrer par ownerId via la relation Hotspot
        // Mais Prisma demande parfois une requête imbriquée.
        // Simplification ici : on filtre après ou on assume que l'accès est protégé par layout
    },
    include: { Hotspot: true },
    orderBy: { createdAt: 'desc' }
  });

  // On filtre manuellement pour être sûr que ça appartient au user connecté (si la query complexe prisma échoue)
  const userOffers = offers.filter(o => o.Hotspot.ownerId === (session?.user as any)?.id || o.Hotspot.ownerId === session?.user?.id);

  // 2. Récupérer les hotspots pour le menu déroulant du modal
  const hotspots = await prisma.hotspot.findMany({
    where: { 
        Owner: { email: session?.user?.email || undefined} 
    }
  });

  // Hack JSON pour éviter l'erreur des Dates
  const safeOffers = JSON.parse(JSON.stringify(userOffers));
  const safeHotspots = JSON.parse(JSON.stringify(hotspots));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Tarifs & Offres
        </h1>
      </div>
      
      <OffersClient initialOffers={safeOffers} hotspots={safeHotspots} />
    </div>
  );
}