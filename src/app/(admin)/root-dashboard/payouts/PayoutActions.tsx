"use client";

import { useState } from "react";
import { approvePayout, rejectPayout } from "@/actions/admin-payouts";
import { Check, X, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function PayoutActions({ payoutId, amount }: { payoutId: string, amount: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    // Confirmation de sécurité
    const confirm = window.confirm(
      `⚠️ ACTION IRRÉVERSIBLE\n\nVous allez envoyer ${amount} FCFA vers ce numéro.\nConfirmer le virement ?`
    );
    if (!confirm) return;

    setIsLoading(true);
    const res = await approvePayout(payoutId); // Plus de paramètre "reference"
    setIsLoading(false);

    if (res.success) {
        toast.success("Virement envoyé avec succès ! 💸");
    } else {
        toast.error(res.error || "Echec du virement");
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Motif du rejet :");
    if (!reason) return;

    setIsLoading(true);
    const res = await rejectPayout(payoutId, reason);
    setIsLoading(false);

    if (res.success) toast.success("Demande rejetée.");
    else toast.error("Erreur lors du rejet");
  };

  if (isLoading) return <Loader2 className="animate-spin text-brand-600" size={20} />;

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleApprove}
        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition shadow-sm text-xs font-bold"
        title="Envoyer l'argent maintenant"
      >
        <Send size={14} /> VIRER
      </button>
      
      <button 
        onClick={handleReject}
        className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition border border-red-200"
        title="Rejeter la demande"
      >
        <X size={16} />
      </button>
    </div>
  );
}