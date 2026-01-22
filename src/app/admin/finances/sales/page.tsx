import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OrdersClient from "./OrdersClient";
import { redirect } from "next/navigation";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/signin");

  // Récupérer les ventes des hotspots appartenant à l'utilisateur
  const orders = await prisma.order.findMany({
    where: {
      Hotspot: {
        ownerId: session?.user?.email ? undefined : 'force-empty', // Sécurité
        Owner: { email: session?.user?.email }
      }
    },
    include: {
      EndUser: true,
      code: true,
      Hotspot: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // On limite aux 100 dernières ventes pour la performance
  });

  const safeOrders = JSON.parse(JSON.stringify(orders));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Mes Ventes
      </h1>
      <OrdersClient data={safeOrders} />
    </div>
  );
}