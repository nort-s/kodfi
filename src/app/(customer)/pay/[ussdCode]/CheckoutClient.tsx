"use client";

import { useState } from "react";
import Script from "next/script";
import { Offer, Hotspot } from "@/lib/prisma";
import { Wifi, Phone, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { verifyPaymentAndDeliverCode } from "@/actions/verify-payment"; // Notre nouvelle action
import toast from "react-hot-toast";
import { normalizeBeninPhone, getBeninOperator } from "@/lib/phone-utils";


// On déclare FedaPay pour TypeScript car il est chargé globalement par le script
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

  // Déclenché quand le script Fedapay est chargé
  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
    // Initialisation avec la clé publique
    if (window.FedaPay) {
      window.FedaPay.init({
        public_key: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY,
        onComplete: (resp: any) => handleFedapayComplete(resp),
      });
    }
  };

  // Déclenché quand le widget se ferme (Succès ou Échec)
  const handleFedapayComplete = async (resp: any) => {   
    
    // resp.reason contient l'état (CHECKOUT_COMPLETED, CHECKOUT_CANCELED...)
    if (resp.reason === window.FedaPay.CHECKOUT_COMPLETED) {
      // Le client dit qu'il a payé. Le widget nous donne un transaction_id.
      // On envoie ça au serveur pour vérification.
      const transactionId = resp.transaction.id;
      await processBackendVerification(transactionId);
    } else {
      setIsLoading(false);
      toast("Paiement annulé", { icon: "❌" });
    }
  };

  const processBackendVerification = async (transactionId: number) => {
    if (!selectedOffer) return;

    const result = await verifyPaymentAndDeliverCode({
        transactionId,
        hotspotId: hotspot.id,
        offerId: selectedOffer.id,
        phone: phone
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

    const cleanedPhone = normalizeBeninPhone(phone);
    if (!cleanedPhone) return toast.error("Numéro de téléphone invalide.");
    // TODO: une fois que je suis sur de la liste de l'arcep je decommente ceci
    // if (getBeninOperator(cleanedPhone) === "UNKNOWN") return toast.error("Opérateur non reconnu (MTN, Moov, Celtiis uniquement).");

    if (!isScriptLoaded) return toast.error("Module de paiement en chargement...");
    
    setIsLoading(true);

    // Ouverture du Widget Fedapay
    try {
        const widget = window.FedaPay.init({
            public_key: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY,
            transaction: {
                amount: selectedOffer.price,
                description: `Achat Ticket ${selectedOffer.name} - ${hotspot.name}`,
                custom_metadata: {
                   hotspot_id: hotspot.id, // Utile pour retrouver dans le dashboard Fedapay
                   offer_name: selectedOffer.name
                }
            },
            customer: {
              // TODO: Verifier s'il n'y a pas moyen de faire ca autrement
                // 👇 L'ASTUCE EST ICI : On remplit avec du faux pour que FedaPay ne demande rien
                email: "client@kodfi.com", 
                lastname: "Client",
                firstname: "Wifi",
                phone_number: {
                    number: phone,
                    country: 'bj' // Bénin
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

  // --- ECRAN SUCCÈS (Identique à avant) ---
  if (purchasedCode) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
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

  // --- ECRAN PAIEMENT ---
  return (
    <>
      {/* Chargement du Script Fedapay */}
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
        </div>

        <form onSubmit={handlePayClick} className="space-y-6">
          
          {/* Choix des Offres (Grille) */}
          <div className="grid grid-cols-2 gap-3">
            {offers.map((offer) => (
              <label 
                key={offer.id}
                className={`relative flex flex-col items-center justify-center p-3 text-center rounded-xl border-2 cursor-pointer transition-all ${
                  selectedOffer?.id === offer.id 
                    ? "border-brand-500 bg-brand-50 shadow-sm" 
                    : "border-gray-200 hover:border-brand-200 bg-gray-50/50"
                }`}
              >
                <input 
                  type="radio" 
                  name="offer_select" 
                  className="sr-only" 
                  onChange={() => setSelectedOffer(offer)}
                />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{offer.name}</span>
                <span className="text-xl font-black text-gray-900 mb-1">{offer.price} <span className="text-xs font-normal text-gray-500">F</span></span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedOffer?.id === offer.id ? "bg-brand-200 text-brand-800" : "bg-gray-200 text-gray-600"}`}>
                  {offer.duration} min
                </span>
                {selectedOffer?.id === offer.id && (
                    <div className="absolute top-2 right-2 text-brand-600"><CheckCircle size={14} /></div>
                )}
              </label>
            ))}
            {offers.length === 0 && <p className="col-span-2 text-center text-gray-500 text-sm">Aucune offre.</p>}
          </div>

          {/* Numéro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro MoMo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                placeholder="Ex: 97000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedOffer || !isScriptLoaded}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" /> En attente validation...</>
            ) : (
              <><CreditCard size={20} /> Payer via MoMo</>
            )}
          </button>
        </form>
      </div>
    </>
  );
}