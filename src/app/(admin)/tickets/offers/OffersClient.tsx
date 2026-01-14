"use client";

import { useState } from "react";
import { Offer, Hotspot } from "@/lib/prisma";
import { Plus, Tag, Clock, Coins } from "lucide-react";
import Button from "@/components/ui/button/Button";
import GenericTable, { ColumnDef } from "@/components/tables/GenericTable";
import OfferModal from "./OfferModal";
import { formatOfferDuration } from "@/lib/utils/format";

// On étend le type Offer pour inclure la relation Hotspot (pour l'affichage)
type OfferWithHotspot = Offer & { Hotspot: Hotspot };

interface OffersClientProps {
  initialOffers: OfferWithHotspot[];
  hotspots: Hotspot[];
}

export default function OffersClient({ initialOffers, hotspots }: OffersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const unitStyles: Record<string, string> = {
    MINUTES: "bg-blue-50 text-blue-600 border-blue-100",
    HOURS: "bg-green-50 text-green-600 border-green-100",
    DAYS: "bg-purple-50 text-purple-600 border-purple-100",
    MONTHS: "bg-yellow-50 text-yellow-600 border-yellow-100",
  };

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
        <div className="flex items-center gap-2">
          {/* On utilise notre helper pour afficher "2 h" au lieu de "2" */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${unitStyles[row.unit] || "bg-gray-50"}`}>
            <Clock size={12} />
            <span>{formatOfferDuration(row.duration, row.unit)}</span>
          </div>
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