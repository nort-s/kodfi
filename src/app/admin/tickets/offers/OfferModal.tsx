"use client";

import { useState } from "react";
import { Hotspot } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { createOffer } from "@/actions/offers"; // Ton action serveur
import toast from "react-hot-toast";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotspots: Hotspot[];
}

export default function OfferModal({ isOpen, onClose, hotspots }: OfferModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

    // Appel de l'action serveur
    const result = await createOffer(formData);

    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Offre créée avec succès !");
      onClose();
    }
  };

  return (
    <Modal title="Nouvelle Offre (Tarif)" isOpen={isOpen} onClose={onClose}
      className="max-w-[700px] p-6 lg:p-10">
      <form action={handleSubmit} className="space-y-4 mt-4">

        {/* Choix du Hotspot */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Point de vente</label>
          <select
            name="hotspotId"
            required
            className="w-full rounded-md border border-gray-300 p-2 bg-white focus:ring-brand-500"
          >
            {hotspots.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* Nom de l'offre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'offre</label>
          <input
            name="name"
            type="text"
            placeholder="Ex: 1 Heure, Pass Journée..."
            required
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
            <input
              name="price"
              type="number"
              placeholder="100"
              required
              min="0"
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-brand-500"
            />
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
            <div className="flex">
              <input
                name="duration"
                type="number"
                required
                min="1"
                className="w-full rounded-l-md border border-gray-300 p-2 focus:ring-brand-500"
              />
              <select
                name="unit"
                className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 p-2 text-sm focus:ring-brand-500"
              >
                <option value="MINUTES">Min</option>
                <option value="HOURS">Heures</option>
                <option value="DAYS">Jours</option>
                <option value="MONTHS">Mois</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} >Annuler</Button>
          <Button variant="primary" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer l'offre"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}