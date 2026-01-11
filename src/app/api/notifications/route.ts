import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // 1. Trouver l'utilisateur
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Récupérer ses notifications (les plus récentes en premier)
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10 // On limite aux 10 dernières pour ne pas charger trop
    });

    // 3. Compter les non-lues
    const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false }
    });

    return NextResponse.json({ notifications, unreadCount });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Optionnel : Route pour marquer comme lu (PUT)
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({}, { status: 401 });

  try {
    const body = await req.json();
    const { id, action } = body; 
    
    // Si on envoie un ID, on marque juste celle-là comme lue
    if (id) {
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        return NextResponse.json({ success: true });
    }
    
    // Sinon (comportement par défaut du dropdown), on marque tout
    const user = await prisma.user.findUnique({ where: { email: session.user.email }});
    if (user) {
        await prisma.notification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true }
        });
    }
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Erreur update" }, { status: 500 });
  }
}