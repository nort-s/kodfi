import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, Role } from "@/lib/prisma";
import { z } from "zod";

const hotspotSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional().or(z.literal("")),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  ownerId: z.string().optional()
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = hotspotSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ message: "Payload invalide" }, { status: 400 });
        }

        const { name, location, redirectUrl, ownerId } = parsed.data;

        if (!name) {
            return NextResponse.json({ message: "Le nom est requis" }, { status: 400 });
        }

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        const finalOwnerId = ownerId ?? currentUser?.id;

        if (!finalOwnerId) {
            return NextResponse.json({ message: "Propriétaire introuvable", currentUser:session.user.email }, { status: 400 });
        }

        let generatedCode = "";
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 20) {
            // Génère un nombre entre 100 et 999
            const randomNum = Math.floor(Math.random() * (999 - 100 + 1) + 100);
            generatedCode = randomNum.toString();

            // Vérifie s'il existe déjà
            const existing = await prisma.hotspot.findFirst({
                where: { ussdCode: generatedCode }
            });

            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return NextResponse.json({ message: "Impossible de générer un code unique, réessayez." }, { status: 500 });
        }

        // Création dans la BDD liée à l'utilisateur connecté
        const newHotspot = await prisma.hotspot.create({
            data: {
                name,
                location: location || null,
                redirectUrl: redirectUrl || null,
                ussdCode: generatedCode, // On insère le code généré
                ownerId: finalOwnerId, 
            },
        });

        return NextResponse.json(newHotspot, { status: 201 });
    } catch (error) {
        console.error("Erreur création hotspot: ", error);
        return NextResponse.json(
            { message: "Erreur serveur" },
            { status: 500 }
        );
    }
}