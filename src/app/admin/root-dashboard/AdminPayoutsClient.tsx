"use client";

import { useState } from "react";
import { processPayoutAdmin } from "@/actions/process-payout"; 
import toast from "react-hot-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AdminPayoutsClient({ payouts }: { payouts: any[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string, amount: number) => {
    if(!confirm(`Confirmer le virement de ${amount} FCFA ? Cette action est irréversible.`)) return;
    
    setProcessingId(id);
    // Appel de l'action serveur qui parle à FedaPay
    const result = await processPayoutAdmin(id); 
    setProcessingId(null);

    if (result.success) {
        toast.success("Virement effectué avec succès !");
        window.location.reload();
    } else {
        toast.error("Erreur : " + result.error);
    }
  };

  if (payouts.length === 0) {
    return <div className="text-gray-500">Aucune demande de retrait en attente. Tout est calme. ☕️</div>;
  }

  return (
    <div className="space-y-4">
      {payouts.map((payout) => (
        <div key={payout.id} className="border p-4 rounded-lg bg-white shadow flex justify-between items-center">
            <div>
                <h3 className="font-bold text-lg">{payout.amount} FCFA</h3>
                <p className="text-sm text-gray-600">
                    Demandé par : <span className="font-semibold">{payout.User.email}</span>
                </p>
                <p className="text-xs text-gray-500">
                    {payout.network} - {payout.phone}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {new Date(payout.createdAt).toLocaleString()}
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => handleApprove(payout.id, payout.amount)}
                    disabled={processingId === payout.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {processingId === payout.id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16}/>}
                    Valider & Payer
                </button>
                
                {/* Pour le bouton Rejeter, tu devras créer une action 'rejectPayout' plus tard */}
                <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                    <XCircle size={16}/> Rejeter
                </button>
            </div>
        </div>
      ))}
    </div>
  );
}