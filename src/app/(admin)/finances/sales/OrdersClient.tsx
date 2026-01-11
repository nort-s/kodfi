"use client";

import { Order, Code, EndUser, Hotspot } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ShoppingCart, Smartphone, CreditCard } from "lucide-react";
import GenericTable, { ColumnDef } from "@/components/tables/GenericTable";
import Badge from "@/components/ui/badge/Badge";

// On étend le type pour inclure les relations
type OrderWithDetails = Order & {
  code: Code | null;
  EndUser: EndUser;
  Hotspot: Hotspot;
};

interface OrdersClientProps {
  data: OrderWithDetails[];
}

export default function OrdersClient({ data }: OrdersClientProps) {
  
  const columns: ColumnDef<OrderWithDetails>[] = [
    {
      header: "Date",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            {format(new Date(row.createdAt), "dd MMM yyyy", { locale: fr })}
          </span>
          <span className="text-xs text-gray-500">
            {format(new Date(row.createdAt), "HH:mm", { locale: fr })}
          </span>
        </div>
      ),
    },
    {
      header: "Client",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-gray-400" />
          <span className="font-mono text-sm">{row.EndUser.phone}</span>
        </div>
      ),
    },
    {
      header: "Ticket Acheté",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-brand-600">
            {row.amount} FCFA
          </span>
          {row.code && (
            <span className="text-xs text-gray-500 font-mono">
              Code: {row.code.code}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Lieu",
      cell: (row) => <span className="text-sm text-gray-600">{row.Hotspot.name}</span>,
    },
    {
      header: "Statut",
      cell: (row) => (
        <Badge
          size="sm"
          color={
            row.status === "PAID" ? "success" :
            row.status === "PENDING" ? "warning" : "error"
          }
        >
          {row.status === "PAID" ? "Payé" : row.status}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Historique des Ventes</h2>
        <p className="text-sm text-gray-500">Suivez les transactions en temps réel.</p>
      </div>

      <GenericTable
        data={data}
        columns={columns}
        searchPlaceholder="Chercher un numéro..."
        itemsPerPage={15}
      />
    </>
  );
}