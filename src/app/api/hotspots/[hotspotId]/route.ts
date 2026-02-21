import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const hotspotPatchSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().nullable().optional().or(z.literal("")), 
  redirectUrl: z.string().url().optional().or(z.literal("")).nullable(),
});

export async function PATCH(
    req: Request,
    // Gestion correcte des params (Promise pour compatibilité future)
    props: { params: Promise<{ hotspotId: string }> }
) {
    // 1. On attend les params (Fix Next.js 15)
    const params = await props.params;

    try {
        // 2. CORRECTION : Pas de () à la fin !
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        // 3. Récupération user fiable (comme dans le POST)
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
             return NextResponse.json({ message: "Session invalide" }, { status: 401 });
        }

        const body = await req.json();
        const validation = hotspotPatchSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { message: "Données invalides", errors: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { name, location, redirectUrl } = validation.data;

        // 4. Vérification existence et propriété
        const existingHotspot = await prisma.hotspot.findUnique({
            where: { id: params.hotspotId },
        });

        if (!existingHotspot) {
            return NextResponse.json({ message: "Wifizone introuvable" }, { status: 404 });
        }

        // Sécurité : Seul le propriétaire peut modifier
        if (existingHotspot.ownerId !== currentUser.id) {
            return NextResponse.json(
                { message: "Vous n'avez pas le droit de modifier ce hotspot" },
                { status: 403 }
            );
        }

        // 5. Mise à jour
        const updatedHotspot = await prisma.hotspot.update({
            where: { id: params.hotspotId },
            data: {
                name, 
                location: location === "" ? null : location,
                redirectUrl: redirectUrl === "" ? null : redirectUrl,
            },
        });

        return NextResponse.json(updatedHotspot);

    } catch (error) {
        console.error("[HOTSPOT_PATCH_ERROR]", error);
        return NextResponse.json(
            { message: "Erreur serveur lors de la modification" },
            { status: 500 }
        );
    }
}


export async function DELETE(
    req: Request,
    props: { params: Promise<{ hotspotId: string }> }
) {
    const params = await props.params;

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
             return NextResponse.json({ message: "Session invalide" }, { status: 401 });
        }

        // Vérification du propriétaire
        const existingHotspot = await prisma.hotspot.findUnique({
            where: { id: params.hotspotId },
        });

        if (!existingHotspot) {
            return NextResponse.json({ message: "Wifizone introuvable" }, { status: 404 });
        }

        if (existingHotspot.ownerId !== currentUser.id) {
            return NextResponse.json(
                { message: "Interdit" },
                { status: 403 }
            );
        }

        // --- SOFT DELETE (Archivage) ---
        // On ne supprime pas la ligne, on met juste une date dans deletedAt
        const deletedHotspot = await prisma.hotspot.update({
            where: { id: params.hotspotId },
            data: {
                deletedAt: new Date(), // C'est ça qui le fait disparaître de la liste
            },
        });

        return NextResponse.json(deletedHotspot);

    } catch (error) {
        console.error("[HOTSPOT_DELETE_ERROR]", error);
        return NextResponse.json(
            { message: "Erreur serveur lors de la suppression" },
            { status: 500 }
        );
    }
}