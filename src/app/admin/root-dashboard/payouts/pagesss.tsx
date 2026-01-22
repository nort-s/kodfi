import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import PayoutActions from "./PayoutActions"; // Le composant qu'on vient de créer
import { Wallet, AlertCircle, History } from "lucide-react";

export const dynamic = "force-dynamic"; // Important pour ne pas cacher les demandes

export default async function AdminPayoutsPage() {

    // 1. Récupérer les demandes en attente (PENDING)
    const pendingPayouts = await prisma.payout.findMany({
        where: { status: "PENDING" },
        include: { User: { select: { firstname: true, lastname: true, email: true } } },
        orderBy: { createdAt: "asc" }, // Les plus vieilles demandes en premier
    });

    // 2. Récupérer l'historique (PROCESSED / REJECTED) - Limité aux 20 derniers
    const historyPayouts = await prisma.payout.findMany({
        where: { status: { in: ["PROCESSED", "REJECTED"] } },
        include: { User: { select: { firstname: true, lastname: true } } },
        orderBy: { processedAt: "desc" },
        take: 20,
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Wallet className="text-brand-600" />
                    Gestion des Retraits
                </h1>
            </div>

            {/* --- SECTION 1 : DEMANDES EN ATTENTE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                    <AlertCircle size={20} className="text-orange-600" />
                    <h2 className="font-semibold text-orange-800">En attente de virement ({pendingPayouts.length})</h2>
                </div>

                {pendingPayouts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Aucune demande en attente. Tout est à jour ! 🚀</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Vendeur</th>
                                    <th className="px-4 py-3">Momo</th>
                                    <th className="px-4 py-3 text-right">Montant (Net)</th>
                                    <th className="px-4 py-3 text-right bg-gray-100">Coût Total (Toi)</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingPayouts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">
                                            {format(p.createdAt, "dd MMM HH:mm", { locale: fr })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{p.User.firstname} {p.User.lastname}</div>
                                            <div className="text-xs text-gray-400">{p.User.email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 ${p.network === 'MTN' ? 'bg-yellow-100 text-yellow-800' :
                                                    p.network === 'MOOV' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                                                }`}>
                                                {p.network}
                                            </span>
                                            <span className="font-mono">{p.phone}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-700">
                                            {p.amount.toLocaleString()} F
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-red-600 bg-gray-50 font-bold border-l border-r border-gray-100">
                                            {/* C'est ce montant que tu dois avoir sur ton compte FedaPay pour payer */}
                                            {(p.totalCost || p.amount + p.fee).toLocaleString()} F
                                        </td>
                                        <td className="px-4 py-3 flex justify-center">
                                            {/* On passe le montant ici */}
                                            <PayoutActions payoutId={p.id} amount={p.amount} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- SECTION 2 : HISTORIQUE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <History size={20} className="text-gray-500" />
                    <h2 className="font-semibold text-gray-700">Historique récent</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                            <tr>
                                <th className="px-4 py-3">Traité le</th>
                                <th className="px-4 py-3">Vendeur</th>
                                <th className="px-4 py-3">Montant</th>
                                <th className="px-4 py-3">Statut</th>
                                <th className="px-4 py-3">Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {historyPayouts.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-500">
                                        {p.processedAt ? format(p.processedAt, "dd MMM HH:mm", { locale: fr }) : "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.User.firstname} {p.User.lastname}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {p.amount.toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.status === "PROCESSED" ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Payé</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Rejeté</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">
                                        {p.status === "PROCESSED" ? `Ref: ${p.reference}` : `Raison: ${p.rejectionReason}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}