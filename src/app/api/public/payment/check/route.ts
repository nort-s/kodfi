import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assure-toi que prisma est bien importé
import { verifyPaymentAndDeliverCode } from "@/actions/verify-payment"; // On réutilise ton action existante !
import { LogEvent } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { transactionId, hotspotUssd, offerId, phone, mac } = await req.json();

    // 1. Retrouver l'ID interne du hotspot via USSD (nécessaire pour verifyPaymentAndDeliverCode)
    const hotspot = await prisma.hotspot.findUnique({ where: { ussdCode: hotspotUssd } });
    if (!hotspot) return NextResponse.json({ error: "Hotspot introuvable" }, { status: 404, headers });

    // 2. Appeler ta logique métier existante
    // Attention : verifyPaymentAndDeliverCode est une Server Action, 
    // mais on peut l'appeler comme une fonction normale ici.
    const result = await verifyPaymentAndDeliverCode({
      transactionId: Number(transactionId),
      hotspotId: hotspot.id,
      offerId,
      phone
    });

    if ("error" in result) {
       // Si c'est une erreur "En attente", on renvoie un statut spécial pour que le widget continue d'attendre
       if (result.error.includes("pas été approuvé")) {
           return NextResponse.json({ status: "PENDING" }, { status: 200, headers });
       }
       // Vraie erreur (stock vide, rejeté...)
       return NextResponse.json({ status: "FAILED", error: result.error }, { status: 200, headers });
    }

    const offer = await prisma.offer.findUnique({ where: { id: offerId } });

    // 3. Succès ! On renvoie le code
    // ICI : On en profite pour enregistrer le LOG ACCESS (Conformité ARCEP Module 3)
    if (result.success) {
        // Tu peux le faire en asynchrone (pas besoin d'attendre)
        prisma.logAccess.create({
            data: {
                hotspotId: hotspot.id,
                macAddress: mac || "NON_DETECTE",
                phone: phone,
                ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                action: LogEvent.PURCHASE,
                details: `Code: ${result.code}`,
                meta: { 
                    amount: offer?.price || "offre introuvable donc bug",
                    method: "FedaPay"
                }
            }
        }).catch(console.error);
    }

    return NextResponse.json({ status: "COMPLETED", code: result.code }, { status: 200, headers });

  } catch (error: any) {
    console.error("Check Error:", error);
    return NextResponse.json({ error: "Erreur check" }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }
  });
}