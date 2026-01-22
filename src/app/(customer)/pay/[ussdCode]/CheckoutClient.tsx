"use client";

import { useState } from "react";
import Script from "next/script";
import { Offer, Hotspot } from "@/lib/prisma";
import { Wifi, Phone, CreditCard, CheckCircle, Loader2, Tag } from "lucide-react";
import { verifyPaymentAndDeliverCode } from "@/actions/verify-payment";
import toast from "react-hot-toast";
import { normalizeBeninPhone, getBeninOperator } from "@/lib/phone-utils";

declare global {
  interface Window {
    FedaPay: any;
  }
}

interface CheckoutClientProps {
  hotspot: Hotspot;
  offers: Offer[];
}

export default function CheckoutClient({ hotspot, offers }: CheckoutClientProps) {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [purchasedCode, setPurchasedCode] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // --- LOGIQUE DE VALIDATION EN TEMPS RÉEL ---
  const cleanedPhone = normalizeBeninPhone(phone);
  const isPhoneValid = cleanedPhone !== null;
  // On affiche l'erreur si l'utilisateur a saisi au moins 8 chiffres et que ce n'est toujours pas valide
  const showPhoneError = phone.length >= 8 && !isPhoneValid;
  const operator = getBeninOperator(phone);

  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
    if (window.FedaPay) {
      window.FedaPay.init({
        public_key: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY,
        onComplete: (resp: any) => handleFedapayComplete(resp),
      });
    }
  };

  const handleFedapayComplete = async (resp: any) => {
    if (resp.reason === window.FedaPay.CHECKOUT_COMPLETED) {
      const transactionId = resp.transaction.id;
      await processBackendVerification(transactionId);
    } else {
      setIsLoading(false);
      toast("Paiement annulé", { icon: "❌" });
    }
  };

  const processBackendVerification = async (transactionId: number) => {
    if (!selectedOffer || !cleanedPhone) return;

    const result = await verifyPaymentAndDeliverCode({
      transactionId,
      hotspotId: hotspot.id,
      offerId: selectedOffer.id,
      phone: cleanedPhone // On envoie la version normalisée (22901...)
    });

    setIsLoading(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      setPurchasedCode(result.code);
      toast.success("Paiement validé !");
    }
  };

  const handlePayClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOffer) return toast.error("Choisis un forfait");
    if (!isPhoneValid || !cleanedPhone) return toast.error("Numéro invalide");
    if (!isScriptLoaded) return toast.error("Module de paiement en chargement...");

    setIsLoading(true);

    try {
      const widget = window.FedaPay.init({
        public_key: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY,
        transaction: {
          amount: selectedOffer.price,
          description: `Achat Ticket ${selectedOffer.name} - ${hotspot.name}`,
          custom_metadata: {
            hotspot_id: hotspot.id,
            offer_name: selectedOffer.name
          }
        },
        customer: {
          email: "client@kodfi.com",
          lastname: "Client",
          firstname: "Wifi",
          phone_number: {
            number: cleanedPhone, // Version propre pour FedaPay
            country: 'bj'
          }
        },
        onComplete: (resp: any) => handleFedapayComplete(resp)
      });

      widget.open();

    } catch (err) {
      console.error(err);
      setIsLoading(false);
      toast.error("Impossible d'ouvrir le paiement");
    }
  };

  if (purchasedCode) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Paiement Réussi !</h2>
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 rounded-xl mb-6 mt-4">
          <span className="text-4xl font-mono font-black text-brand-600 tracking-wider">
            {purchasedCode}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Copiez ce code pour vous connecter.</p>
        <button onClick={() => window.location.reload()} className="text-brand-600 font-medium hover:underline">
          Acheter un autre ticket
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.fedapay.com/checkout.js?v=1.1.7"
        onLoad={handleScriptLoad}
      />

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-xl mb-3">
            <Wifi size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">{hotspot.name}</h1>
          <p className="text-xs text-gray-500 mt-1">Choisissez votre forfait et payez par MoMo</p>
        </div>

        <form onSubmit={handlePayClick} className="space-y-6">

          {/* Choix des Offres */}
          <div className="grid grid-cols-2 gap-3">
            {offers.map((offer) => (
              <label
                key={offer.id}
                className={`relative flex flex-col items-center justify-center p-3 text-center rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOffer?.id === offer.id
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-gray-100 hover:border-brand-200 bg-gray-50/50 text-gray-600"
                  }`}
              >
                <input
                  type="radio"
                  name="offer_select"
                  className="sr-only"
                  onChange={() => setSelectedOffer(offer)}
                />
                <span className="text-[10px] font-bold uppercase tracking-tight mb-1 opacity-70">{offer.name}</span>
                <span className="text-xl font-black text-gray-900 mb-1">{offer.price} <span className="text-xs font-normal">F</span></span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedOffer?.id === offer.id ? "bg-brand-200 text-brand-900" : "bg-gray-200 text-gray-500"}`}>
                  {offer.duration} min
                </span>
                {selectedOffer?.id === offer.id && (
                  <div className="absolute top-2 right-2 text-brand-600 animate-in zoom-in"><CheckCircle size={14} /></div>
                )}
              </label>
            ))}
            {offers.length === 0 && <p className="col-span-2 text-center text-gray-400 text-sm">Aucun forfait disponible.</p>}
          </div>

          {/* Champ Numéro avec Validation Visuelle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro MoMo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className={isPhoneValid ? "text-green-500" : "text-gray-400"} />
              </div>
              <input
                type="tel"
                placeholder="Ex: 97000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={`block w-full pl-10 pr-10 py-3.5 border rounded-xl transition-all focus:outline-none focus:ring-2 ${
                    showPhoneError 
                      ? "border-red-400 focus:ring-red-100 bg-red-50" 
                      : isPhoneValid 
                      ? "border-green-500 focus:ring-green-100 bg-green-50" 
                      : "border-gray-200 focus:ring-brand-500"
                  }`}
              />
              {isPhoneValid && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircle size={18} className="text-green-500 animate-in fade-in" />
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-start mt-1.5 px-1">
              <div className="min-h-[16px]">
                {showPhoneError && (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Format invalide (8 ou 10 chiffres)</p>
                )}
              </div>
              {phone.length >= 2 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded transition-colors ${
                    operator === "MTN" ? "bg-yellow-400 text-yellow-900" :
                    operator === "MOOV" ? "bg-blue-500 text-white" :
                    operator === "CELTIIS" ? "bg-red-500 text-white" :
                    "bg-gray-100 text-gray-400"
                }`}>
                  {operator}
                </span>
              )}
            </div>
          </div>

          {/* Bouton de Paiement Bloqué */}
          <button
            type="submit"
            disabled={isLoading || !selectedOffer || !isScriptLoaded || !isPhoneValid}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale disabled:scale-100"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" /> Vérification...</>
            ) : (
              <><CreditCard size={20} /> Payer {selectedOffer?.price || ""} FCFA</>
            )}
          </button>
        </form>
      </div>
    </>
  );
}