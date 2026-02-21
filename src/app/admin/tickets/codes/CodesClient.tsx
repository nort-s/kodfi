"use client";

import { useState } from "react";
import { Code, Hotspot, Offer } from "@/lib/prisma";
import { Download, Ticket, CheckCircle, XCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge"; // Ton composant Badge
import GenericTable, { ColumnDef } from "@/components/tables/GenericTable";
import ImportCodesModal from "./ImportCodesModal";

// On étend le type pour l'affichage
type CodeWithDetails = Code & { 
    Offer: Offer | null; 
    Hotspot: Hotspot 
};

interface CodesClientProps {
  initialCodes: CodeWithDetails[];
  hotspots: Hotspot[];
  offers: Offer[];
}

export default function CodesClient({ initialCodes, hotspots, offers }: CodesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Colonnes de la table
  const columns: ColumnDef<CodeWithDetails>[] = [
    {
      header: "Code",
      cell: (row) => (
        <div className="font-mono font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded inline-block">
            {row.code}
        </div>
      ),
    },
    {
      header: "Offre (Tarif)",
      cell: (row) => (
        <div className="flex flex-col">
            <span className="font-medium text-sm">{row.Offer?.name || "Standard"}</span>
            <span className="text-xs text-gray-500">{row.Offer?.price} FCFA</span>
        </div>
      ),
    },
    {
      header: "Hotspot",
      cell: (row) => <span className="text-sm text-gray-600">{row.Hotspot.name}</span>,
    },
    {
      header: "Statut",
      cell: (row) => (
        <Badge
          size="sm"
          color={
            row.status === "AVAILABLE" ? "success" : 
            row.status === "SOLD" ? "warning" : "error"
          }
        >
          {row.status === "AVAILABLE" ? "Disponible" : 
           row.status === "SOLD" ? "Vendu" : row.status}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h2 className="text-lg font-semibold text-gray-800">Stock de Tickets</h2>
            <p className="text-sm text-gray-500">Gérez les codes générés depuis votre routeur</p>
        </div>
        
        {/* <Button
          size="md"
          variant="primary"
          startIcon={<Download size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Importer des Codes
        </Button> */}
      </div>

      <GenericTable
        data={initialCodes}
        columns={columns}
        searchPlaceholder="Rechercher un code..."
        itemsPerPage={10}
      />

      {/* Le Modal d'Import */}
      <ImportCodesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        hotspots={hotspots}
        offers={offers}
      />
    </>
  );
}