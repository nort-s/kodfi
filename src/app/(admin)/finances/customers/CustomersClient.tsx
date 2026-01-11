"use client";

import { Users, Phone, ExternalLink } from "lucide-react";
import GenericTable, { ColumnDef } from "@/components/tables/GenericTable";
import Button from "@/components/ui/button/Button";

// Type personnalisé pour les données agrégées
type CustomerRow = {
  id: string;
  phone: string;
  lastVisit: string;
  totalOrders: number;
  totalSpent: number;
};

interface CustomersClientProps {
  data: CustomerRow[];
}

export default function CustomersClient({ data }: CustomersClientProps) {

  const columns: ColumnDef<CustomerRow>[] = [
    {
      header: "Numéro Client",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
            <Users size={16} />
          </div>
          <span className="font-mono font-medium text-gray-700">{row.phone}</span>
        </div>
      ),
    },
    {
      header: "Dernière visite",
      cell: (row) => <span className="text-sm text-gray-500">{new Date(row.lastVisit).toLocaleDateString("fr-FR")}</span>,
    },
    {
      header: "Achats (Fidélité)",
      cell: (row) => (
        <div className="text-sm">
            <span className="font-bold">{row.totalOrders}</span> tickets achetés
        </div>
      ),
    },
    {
      header: "Dépense Totale",
      cell: (row) => <span className="font-bold text-green-600">{row.totalSpent} FCFA</span>,
    },
    {
        header: "Action",
        cell: (row) => (
            <a 
                href={`https://wa.me/${row.phone}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-green-500 hover:text-green-700 flex items-center gap-1 text-sm font-medium"
            >
                <Phone size={14} /> WhatsApp
            </a>
        )
    }
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Base Client</h2>
        <p className="text-sm text-gray-500">Vos clients fidèles (triés par montant dépensé).</p>
      </div>

      <GenericTable
        data={data}
        columns={columns}
        searchPlaceholder="Rechercher un numéro..."
        itemsPerPage={10}
      />
    </>
  );
}