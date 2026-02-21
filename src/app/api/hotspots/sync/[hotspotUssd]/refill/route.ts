import { NextRequest, NextResponse } from "next/server";
import { prisma, DurationUnit } from "@/lib/prisma";
import { generateRandomCode } from "@/lib/utils/generateRandomCode";
import { formatMikrotikDuration } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";


function getTechnicalProfileName(duration: number, unit: DurationUnit): string {
    let totalMinutes = duration;

    if (unit === "HOURS") totalMinutes = duration * 60;
    if (unit === "DAYS") totalMinutes = duration * 60 * 24;
    if (unit === "MONTHS") totalMinutes = duration * 60 * 24 * 30;

    return `kodfi_${totalMinutes}m`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ hotspotUssd: string }> }) {
    // export async function POST(req: NextRequest, { params }: { params: { ussd: string } }) {
    try {
        // 👇 On doit await params avant de l'utiliser
        // const { ussd } = params;
        const { hotspotUssd } = await params;
        const clientSecret = req.headers.get("X-Kodfi-Secret");

        // 1. Récupérer les stocks du Mikrotik
        const body = await req.json();
        const currentStocks = body.stocks || {};

        // 2. Vérifier le Hotspot via ussdCode
        const hotspot = await prisma.hotspot.findUnique({
            where: { ussdCode: hotspotUssd }, // On utilise la variable récupérée
            include: { offers: true },
        });

        if (!hotspot) {
            // Log spécifique pour le script Mikrotik
            return new NextResponse(":log error message=Kodfi_Hotspot_Introuvable", { status: 404 });
        }

        if (!hotspot || hotspot.secretKey !== clientSecret) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const TARGET_BUFFER = 50;
        let scriptCommands: string[] = [];

        const processedProfiles = new Set<string>();

        // 3. Boucle sur chaque offre
        for (const offer of hotspot.offers) {
            const profileName = getTechnicalProfileName(offer.duration, offer.unit);

            // 2. Commande de Création/Update du Profil (Une seule fois par durée)
            if (!processedProfiles.has(profileName)) {

                // Conversion durée pour Mikrotik (ex: 01:00:00)
                // On réutilise ta fonction formatMikrotikDuration ou on fait simple ici car on a les minutes
                // Astuce Mikrotik : on peut donner les minutes directement pour le session-timeout : 60m
                const mikrotikTime = profileName.replace("kodfi_", ""); // récupère "60m"

                // Commande robuste : Crée ou Update
                scriptCommands.push(
                    `/if ([:len [/ip hotspot user profile find name="${profileName}"]] = 0) do={ /ip hotspot user profile add name="${profileName}" session-timeout=${mikrotikTime} shared-users=1 keepalive-timeout=none } else={ /ip hotspot user profile set [find name="${profileName}"] session-timeout=${mikrotikTime} }`
                );

                processedProfiles.add(profileName);
            }

            // const duration = formatMikrotikDuration(offer.duration, offer.unit);

            // scriptCommands.push(
            //     `/if ([:len [/ip hotspot user profile find name="${profileName}"]] = 0) do={ /ip hotspot user profile add name="${profileName}" session-timeout=${duration} shared-users=1 keepalive-timeout=none } else={ /ip hotspot user profile set [find name="${profileName}"] session-timeout=${duration} }`
            // );


            const currentCount = currentStocks[profileName] || 0;
            const needed = TARGET_BUFFER - currentCount;

            if (needed > 0) {
                const newCodesData = [];

                for (let i = 0; i < needed; i++) {
                    const codeString = generateRandomCode(8);

                    newCodesData.push({
                        hotspotId: hotspot.id,
                        offerId: offer.id,
                        code: codeString,
                        status: "AVAILABLE",
                    });

                    // Commande Mikrotik
                    scriptCommands.push(
                        `/ip hotspot user add name="${codeString}" password="kd" profile="${profileName}" comment="kodfi_av_${profileName}"`
                    );
                }

                // Sauvegarde DB
                await prisma.code.createMany({
                    data: newCodesData as any,
                    skipDuplicates: true,
                });
            }
        }

        if (scriptCommands.length === 0) {
            return new NextResponse(":log info message=Kodfi_Stock_Ok", { status: 200 });
        }

        return new NextResponse(scriptCommands.join("\n"), {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });

    } catch (error) {
        console.error("Erreur Refill:", error);
        return new NextResponse(":log error message=Kodfi_Erreur_Serveur", { status: 500 });
    }
}