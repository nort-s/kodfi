"use client";

import { useState } from "react";
import { requestPayout } from "@/actions/request-payout"; // Vérifie le chemin
import { Loader2, Wallet, ArrowUpRight, History } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // 👈 Pour le rafraîchissement fluide

interface WalletClientProps {
    balance: number;
    totalSales: number;
    totalPayouts: number;
    history: any[];
}

export default function WalletClient({ balance, totalSales, totalPayouts, history }: WalletClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !phone || !password) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        setLoading(true);
        
        // On n'envoie plus "network", le serveur le devine tout seul
        const result = await requestPayout({
            amount: parseInt(amount),
            phone,
            password 
        });
        
        setLoading(false);

        if ("success" in result) { // Si ton action renvoie { success: true }
            toast.success("Demande de retrait envoyée !");
            setAmount("");
            setPassword("");
            router.refresh(); // 👈 Rafraîchit les données serveur (solde, historique)
        } else {
            toast.error(result.error || "Erreur inconnue");
        }
    };

    return (
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-2">

            {/* COLONNE GAUCHE : SOLDE & RETRAIT */}
            <div className="flex flex-col gap-9">

                {/* CARTE SOLDE */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
                            <Wallet size={20} className="text-primary" /> Solde Disponible
                        </h3>
                    </div>
                    <div className="p-6.5 text-center">
                        <h2 className="text-4xl font-bold text-black dark:text-white mb-2">
                            {balance.toLocaleString()} FCFA
                        </h2>
                        <p className="text-sm text-gray-500">
                            Revenu Net : {totalSales.toLocaleString()} FCFA <br />
                            Déjà retiré : {totalPayouts.toLocaleString()} FCFA
                        </p>
                    </div>
                </div>

                {/* FORMULAIRE */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
                            <ArrowUpRight size={20} /> Demander un retrait
                        </h3>
                    </div>
                    <form onSubmit={handleWithdraw}>
                        <div className="p-6.5">
                            <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Montant à retirer (FCFA)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Ex: 5000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Numéro Mobile Money (Bénin)
                                </label>
                                <input
                                    type="text"
                                    placeholder="97000000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                />
                                <p className="text-xs text-gray-500 mt-1">Opérateur détecté automatiquement.</p>
                            </div>
                            
                            <div className="mb-6">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Mot de passe de sécurité <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Votre mot de passe actuel"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50 text-white"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Confirmer le retrait"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* COLONNE DROITE : HISTORIQUE */}
            <div className="flex flex-col gap-9">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
                            <History size={20} /> Historique
                        </h3>
                    </div>
                    <div className="p-6.5">
                        {history.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Aucun retrait.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {history.map((tx: any) => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded bg-gray-50 dark:bg-meta-4 dark:border-strokedark">
                                        <div>
                                            <p className="font-bold text-sm text-black dark:text-white">
                                                Vers {tx.network} ({tx.phone})
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-black dark:text-white">
                                                -{tx.amount.toLocaleString()} F
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                tx.status === 'PROCESSED' ? 'bg-green-100 text-green-700' :
                                                tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {tx.status === 'PENDING' ? 'En attente' :
                                                 tx.status === 'PROCESSED' ? 'Payé' : 'Rejeté'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}