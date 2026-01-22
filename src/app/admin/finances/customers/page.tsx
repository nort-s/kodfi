import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CustomersClient from "./CustomersClient";
import { redirect } from "next/navigation";


export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/signin");
  // 1. On cherche tous les EndUser qui ont acheté chez CE provider
  // Cette requête est simplifiée. Pour de la vraie Big Data on ferait du SQL brut (groupBy), 
  // mais pour Prisma et moins de 10k lignes, ça passe.
  
  const myClientsOrders = await prisma.order.findMany({
    where: {
        Hotspot: { Owner: { email: session?.user?.email } },
        status: 'PAID'
    },
    select: {
        amount: true,
        createdAt: true,
        EndUser: {
            select: { id: true, phone: true }
        }
    }
  });

  // 2. Traitement des données en JavaScript (Agrégation)
  const clientsMap = new Map();

  myClientsOrders.forEach(order => {
      const phone = order.EndUser.phone;
      
      if (!clientsMap.has(phone)) {
          clientsMap.set(phone, {
              id: order.EndUser.id,
              phone: phone,
              lastVisit: order.createdAt,
              totalOrders: 0,
              totalSpent: 0
          });
      }

      const client = clientsMap.get(phone);
      client.totalOrders += 1;
      client.totalSpent += order.amount;
      
      // Mettre à jour la date si cette commande est plus récente
      if (new Date(order.createdAt) > new Date(client.lastVisit)) {
          client.lastVisit = order.createdAt;
      }
  });

  // 3. Convertir la Map en tableau et trier par dépense (les meilleurs clients en haut)
  const clientsArray = Array.from(clientsMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent);

  const safeClients = JSON.parse(JSON.stringify(clientsArray));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Mes Clients
      </h1>
      <CustomersClient data={safeClients} />
    </div>
  );
}