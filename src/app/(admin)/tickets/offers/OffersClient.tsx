"use client";

import { useState } from "react";
import { Offer, Hotspot } from "@/lib/prisma";
import { Plus, Tag, Clock, Coins } from "lucide-react";
import Button from "@/components/ui/button/Button";
import GenericTable, { ColumnDef } from "@/components/tables/GenericTable";
import OfferModal from "./OfferModal";

// On étend le type Offer pour inclure la relation Hotspot (pour l'affichage)
type OfferWithHotspot = Offer & { Hotspot: Hotspot };

interface OffersClientProps {
  initialOffers: OfferWithHotspot[];
  hotspots: Hotspot[];
}

export default function OffersClient({ initialOffers, hotspots }: OffersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Définition des colonnes
  const columns: ColumnDef<OfferWithHotspot>[] = [
    {
      header: "Nom de l'offre",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <Tag size={16} />
          </div>
          <span className="font-medium text-gray-700">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Prix",
      cell: (row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Coins size={16} />
          <span className="font-bold">{row.price} FCFA</span>
        </div>
      ),
    },
    {
      header: "Durée",
      cell: (row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} />
          <span>{row.duration} min</span>
        </div>
      ),
    },
    {
      header: "Point de Vente",
      cell: (row) => <span className="text-sm text-gray-500">{row.Hotspot.name}</span>,
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          size="md"
          variant="primary"
          startIcon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
          disabled={hotspots.length === 0} // Pas de hotspot = pas d'offre possible
        >
          Nouvelle Offre
        </Button>
      </div>

      {hotspots.length === 0 && (
         <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
            ⚠️ Vous devez d'abord créer un Hotspot avant de définir des offres.
         </div>
      )}

      <GenericTable
        data={initialOffers}
        columns={columns}
        searchPlaceholder="Rechercher une offre..."
        itemsPerPage={10}
      />

      {/* Modal de création */}
      <OfferModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        hotspots={hotspots} 
      />
    </>
  );
}