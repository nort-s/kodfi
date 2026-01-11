"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown } from "lucide-react";
import Pagination from "./Pagination"; // Assure-toi du bon chemin

// Définition d'une colonne
export type ColumnDef<T> = {
  header: string;
  accessorKey?: keyof T; // La clé dans l'objet (ex: 'name', 'status')
  cell?: (row: T) => React.ReactNode; // Rendu personnalisé (ex: Badge, Date)
  className?: string; // Classes CSS spécifiques (ex: 'text-right')
};

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  // Fonction qui retourne le contenu du menu d'actions pour une ligne donnée
  renderActions?: (row: T) => React.ReactNode; 
}

export default function GenericTable<T extends { id: string | number }>({
  data,
  columns,
  title = "Liste",
  searchPlaceholder = "Rechercher...",
  itemsPerPage = 5,
  renderActions,
}: GenericTableProps<T>) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filtrage (Recherche simple sur toutes les valeurs textuelles)
  const filteredData = data.filter((item) =>
    Object.values(item as any).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 2. Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset page quand on cherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
      
      {/* --- En-tête : Titre + Recherche --- */}
      <div className="mb-4 flex flex-col gap-2 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
   
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
            <Search size={20} className="text-gray-500 dark:text-gray-400" />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-[42px] text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      {/* --- Tableau --- */}
      <div className="custom-scrollbar max-w-full overflow-x-auto overflow-y-visible px-5 sm:px-6 min-h-[300px]">
        <table className="min-w-full">
          <thead className="border-y border-gray-100 py-3 dark:border-gray-800">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-5 font-normal whitespace-nowrap text-left text-theme-sm text-gray-500 dark:text-gray-400 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th className="py-3 px-5 font-normal whitespace-nowrap text-right text-theme-sm text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {currentData.length > 0 ? (
              currentData.map((row) => (
                <tr key={row.id}>
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`py-3 px-5 whitespace-nowrap text-theme-sm text-gray-700 dark:text-gray-400 ${col.className || ""}`}
                    >
                      {col.cell
                        ? col.cell(row) // Rendu personnalisé
                        : col.accessorKey
                        ? String(row[col.accessorKey]) // Rendu direct
                        : "-"}
                    </td>
                  ))}

                  {/* Colonne Actions (Dropdown) */}
                  {renderActions && (
                    <td className="py-3 px-5 whitespace-nowrap text-right">
                      <ActionMenu>
                        {renderActions(row)}
                      </ActionMenu>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="py-10 text-center text-gray-500"
                >
                  Aucune donnée trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Footer : Pagination --- */}
      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

// --- Composant Interne pour le Menu Dropdown ---
function ActionMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex flex-col gap-1" onClick={() => setIsOpen(false)}>
             {/* Les actions spécifiques sont injectées ici */}
            {children}
          </div>
        </div>
      )}
    </div>
  );
}