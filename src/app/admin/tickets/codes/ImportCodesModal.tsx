"use client";

import { useState, useMemo } from "react";
import { Hotspot, Offer } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { importCodes } from "@/actions/import-codes";
import toast from "react-hot-toast";

interface ImportCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotspots: Hotspot[];
  offers: Offer[];
}

export default function ImportCodesModal({ isOpen, onClose, hotspots, offers }: ImportCodesModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Gestion de l'état local pour filtrer les offres
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>("");

  // On filtre les offres affichées en fonction du hotspot choisi
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => offer.hotspotId === selectedHotspotId);
  }, [offers, selectedHotspotId]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    const result = await importCodes(formData);
    
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`${result.count} tickets importés avec succès !`);
      // Reset du formulaire
      setSelectedHotspotId("");
      onClose();
    }
  };

  return (
    <Modal title="Importer du Stock (Tickets)" isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6 lg:p-10">
      <form action={handleSubmit} className="space-y-5 mt-4">
        
        {/* ÉTAPE 1 : CHOISIR LE LIEU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            1. Sélectionner le Hotspot
          </label>
          <select 
            name="hotspotId"
            required 
            value={selectedHotspotId}
            onChange={(e) => setSelectedHotspotId(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 bg-white focus:ring-brand-500"
          >
            <option value="">-- Choisir un lieu --</option>
            {hotspots.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* ÉTAPE 2 : CHOISIR LE TARIF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            2. Type de Ticket (Offre)
          </label>
          <select 
            name="offerId"
            required 
            disabled={!selectedHotspotId}
            className="w-full rounded-md border border-gray-300 p-2 bg-white focus:ring-brand-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">-- Choisir un tarif --</option>
            {filteredOffers.map(offer => (
                <option key={offer.id} value={offer.id}>
                    {offer.name} ({offer.price} FCFA - {offer.duration} {offer.unit})
                </option>
            ))}
          </select>
          {selectedHotspotId && filteredOffers.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Aucune offre créée pour ce hotspot.</p>
          )}
        </div>

        {/* ÉTAPE 3 : COLLER LES CODES */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            3. Coller les codes (un par ligne)
          </label>
          <textarea
            name="rawCodes"
            required
            rows={8}
            placeholder="AZERT-123&#10;POIUY-456&#10;MLKJH-789"
            className="w-full rounded-md border border-gray-300 p-2 font-mono text-sm focus:ring-brand-500"
          />
           <p className="text-xs text-gray-500 mt-1">
            Copiez la colonne "Code" depuis votre fichier Excel ou Mikrotik.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} >Annuler</Button>
          <Button variant="primary" disabled={isLoading || !selectedHotspotId}>
            {isLoading ? "Import en cours..." : "Valider l'import"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}