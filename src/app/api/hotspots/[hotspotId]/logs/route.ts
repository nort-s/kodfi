import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// Si tu utilises NextAuth
// Importe tes options d'auth si besoin

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ hotspotId: string }> }
) {
    try {
        const { hotspotId } = await params;

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const logs = await prisma.logAccess.findMany({
            where: { hotspotId: hotspotId },
            orderBy: { createdAt: 'desc' },
            take: 100 // On limite aux 100 derniers pour l'instant
        });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}