import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

// IMPORTANT : Force le rendu dynamique pour avoir les dernières offres
export const dynamic = 'force-dynamic';

export default async function PaymentPage({ params }: { params: Promise<{ ussdCode: string }> }) {
    
    // Fix Next.js 15
    const resolvedParams = await params;


    // console.log(resolvedParams.ussdCode);
    // return;

    // 1. On récupère le Hotspot et ses Offres

    const hotspot = await prisma.hotspot.findUnique({
    where: { ussdCode: resolvedParams.ussdCode },
    include: {
        offers: {
            where: { 
                deletedAt: null, // Pas supprimée
                codes: {
                    some: {
                        status: "AVAILABLE", // Au moins un code disponible
                        deletedAt: null      // Qui n'est pas supprimé (soft delete)
                    }
                }
            },
            orderBy: { price: 'asc' }
        }
    }
});

    // console.log(hotspot);
    // return;

    if (!hotspot) {
        return notFound(); // Affiche la page 404 si l'ID est faux
    }

    // Sécurité : Si le hotspot est désactivé
    if (hotspot.state !== "ACTIVE") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <h1 className="text-xl font-bold text-red-600">Service Indisponible</h1>
                    <p className="text-gray-600 mt-2">Ce point de vente est temporairement fermé.</p>
                </div>
            </div>
        );
    }

    // Hack JSON habituel
    const safeHotspot = JSON.parse(JSON.stringify(hotspot));
    const safeOffers = JSON.parse(JSON.stringify(hotspot.offers));

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <CheckoutClient hotspot={safeHotspot} offers={safeOffers} />
            
            <div className="mt-8 text-center text-sm text-gray-400">
                Propulsé par <span className="font-bold text-gray-600">Nort's</span>
            </div>
        </div>
    );
}