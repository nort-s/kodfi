import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FedaPay, Transaction } from "fedapay";

FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || "");
FedaPay.setEnvironment(process.env.NODE_ENV === "production" ? "live" : "sandbox");

export async function POST(req: NextRequest) {
  // Gérer CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { offerId, phone, hotspotUssd, mac } = await req.json();

    // 1. Vérifier l'offre
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) return NextResponse.json({ error: "Offre invalide" }, { status: 400, headers });

    // 2. Créer la transaction FedaPay
    const transaction = await Transaction.create({
      description: `Wifi ${offer.name}`,
      amount: offer.price,
      currency: { iso: "XOF" },
      callback_url: "https://ton-site.com/api/webhook", // Optionnel pour l'instant
      mode: "mobile_money",
      customer: {
        phone_number: { number: phone, country: "bj" },
        email: "client@kodfi.com", // Email générique
      }
    });

    // 3. Générer le Token de paiement (Lancer le push USSD)
    const token = await transaction.generateToken();
    
    console.log("------------------------------------------------");
    console.log("🔗 URL DE VALIDATION SANDBOX :", token.url);
    console.log("------------------------------------------------");
    
    // Si c'est en live, ça envoie le push sur le téléphone.
    // Note: En Sandbox, il faut souvent valider manuellement via le lien, 
    // mais ici on renvoie l'ID pour que le frontend puisse vérifier le statut.

    return NextResponse.json({ 
      success: true, 
      transactionId: transaction.id,
      message: "Veuillez valider sur votre téléphone" 
    }, { status: 200, headers });

  } catch (error: any) {
    console.error("Init Payment Error:", error);
    return NextResponse.json({ error: error.message || "Erreur init" }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}