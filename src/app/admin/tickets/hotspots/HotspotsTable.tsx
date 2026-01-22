"use client";

import { Hotspot } from '../../../../../prisma/generated/client'

import { Wifi, MapPin, Globe, Eye, Trash2, Edit } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import GenericTable, { ColumnDef } from "@/components/tables/GenericTable"; // Import du composant générique

interface HotspotsTableProps {
  data: Hotspot[];
  onEdit: (hotspot: Hotspot) => void;
  onDelete: (id: string) => void;
}

export default function HotspotsTable({ data, onEdit, onDelete }: HotspotsTableProps) {

  // 1. Définition des colonnes
  const columns: ColumnDef<Hotspot>[] = [
    {
      header: "Nom du Hotspot",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
            <Wifi size={18} />
          </div>
          <div>
            <span className="block font-medium text-gray-700 dark:text-gray-300">
              {row.name}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Emplacement",
      cell: (row) => {
        const text = row.location || "Non renseigné";
        // Si le texte dépasse 20 caractères, on coupe et on ajoute "..."
        const truncated = text.length > 20 ? text.substring(0, 20) + "..." : text;

        return (
          <span 
            title={text} // Affiche tout le texte quand on passe la souris dessus
            className="text-sm text-gray-500 cursor-help" // cursor-help montre un petit "?"
          >
            {truncated}
          </span>
        );
      },
    },
    {
      header: "Redirection",
      cell: (row) => (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Globe size={16} />
          <span className="truncate max-w-[150px]">{row.redirectUrl || "-"}</span>
        </div>
      ),
    },
    {
      header: "État",
      cell: (row) => (
        <Badge
          size="sm"
          color={
            row.state === "ACTIVE"
              ? "success"
              : row.state === "INACTIVE" || row.state === "SUSPENDED"
                ? "warning"
                : "error"
          }
        >
          {row.state}
        </Badge>
      ),
    },
    {
      // header: "Code USSD",
      header: "Code Hotspot",
      cell: (row) => (
        row.ussdCode ? (
          <div className="flex flex-col">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold bg-purple-100 text-purple-800 font-mono tracking-wider">
              {/* *323*{row.ussdCode}# TODO: Modifier le format du code USSD une fois que la fonctionnalité est implémentee */} 
              {row.ussdCode}
            </span>
            <span className="text-[10px] text-gray-400 mt-1">Code unique généré</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">En attente...</span>
        )
      ),
    },
    {
      header: "Créé le",
      cell: (row) => new Date(row.createdAt).toLocaleDateString("fr-FR"),
    },
  ];

  // 2. Définition des actions (Le contenu du dropdown)
  const renderActions = (row: Hotspot) => (
    <>
      {/* <button 
        onClick={() => console.log("Voir", row.id)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition"
      >
        <Eye size={16} />
        Détails
      </button> */}
      <button
        onClick={() => onEdit(row)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition"
      >
        <Edit size={16} />
        Modifier
      </button>
      <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
      <button
        onClick={() => onDelete(row.id)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition"
      >
        <Trash2 size={16} />
        Supprimer
      </button>
    </>
  );

  // 3. Rendu final
  return (
    <GenericTable
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par nom, lieu..."
      itemsPerPage={5}
      renderActions={renderActions}
    />
  );
}