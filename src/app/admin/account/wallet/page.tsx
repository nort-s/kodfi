import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWalletBalance } from "@/lib/finance";
import { redirect } from "next/navigation";
import WalletClient from "./WalletClient"; // On va créer ce composant juste après

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  
  // 1. Auth Check (Sécurité serveur)
  if (!session?.user?.email) redirect("/api/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) return <div>Erreur compte.</div>;

  // 2. Récupérer les données financières calculées
  const financeData = await getWalletBalance(user.id);

  // 3. Récupérer l'historique brut pour le tableau
  // On mélange les Payouts (Retraits) et les Orders (Ventes) pour tout voir
  const payouts = await prisma.payout.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  // On passe tout au composant Client pour l'interactivité
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Mon Portefeuille
        </h2>
      </div>

      <WalletClient 
        balance={financeData.balance} 
        totalSales={financeData.totalSales}
        totalPayouts={financeData.totalPayouts}
        history={JSON.parse(JSON.stringify(payouts))} // Hack pour les dates
      />
    </div>
  );
}