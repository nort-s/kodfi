import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminPayoutsClient from "./AdminPayoutsClient";

export default async function SecretAdminPage() {
  const session = await getServerSession(authOptions);
  
  console.log(session?.user?.role)
  // SÉCURITÉ : Remplace par ton email exact
  if (session?.user?.role !== "ADMIN") { // || session?.user?.email !== "ton_email_admin@gmail.com") {
      return <div>Accès Interdit. IP loggée.</div>;
  }

  // Récupérer les demandes EN ATTENTE
  const pendingPayouts = await prisma.payout.findMany({
    where: { status: "PENDING" },
    include: { User: { select: { email: true } } }, // On veut savoir qui demande
    orderBy: { createdAt: "desc" }
  });

  // Hack JSON pour les dates
  const safePayouts = JSON.parse(JSON.stringify(pendingPayouts));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-red-600">
        🚨 Zone Admin : Validation des Retraits
      </h1>
      <AdminPayoutsClient payouts={safePayouts} />
    </div>
  );
}