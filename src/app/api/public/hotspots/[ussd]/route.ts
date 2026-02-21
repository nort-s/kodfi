import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ussd: string }> }
) {
  // 1. Gérer les CORS (Indispensable pour que le Widget marche sur le Mikrotik)
  const headers = {
    "Access-Control-Allow-Origin": "*", // Autorise n'importe quel portail captif
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { ussd } = await params;

    // 2. Récupérer le Hotspot et ses Offres actives
    const hotspot = await prisma.hotspot.findUnique({
      where: { ussdCode: ussd },
      select: {
        id: true,
        name: true,
        offers: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true, // Utile pour afficher "1 Heure"
            unit: true      // "HOURS"
          },
          orderBy: { price: 'asc' } // Les moins chères en premier
        }
      }
    });

    if (!hotspot) {
      return NextResponse.json(
        { error: "Hotspot introuvable" },
        { status: 404, headers }
      );
    }

    // 3. Répondre au Widget
    return NextResponse.json(hotspot, { status: 200, headers });

  } catch (error) {
    console.error("API Public Error:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500, headers }
    );
  }
}

// Gérer la requête "OPTIONS" (Pre-flight check des navigateurs)
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}