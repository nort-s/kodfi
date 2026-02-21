"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hotspot } from '../../../../../prisma/generated/client';

import { Wifi, MapPin, Globe, Eye, Trash2, Edit, FileCode, X, ShieldCheck } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import GenericTable, { ColumnDef } from "@/components/tables/GenericTable"; // Import du composant générique
import ScriptGenerator from "./ScriptGenerator";
import { Modal } from "@/components/ui/modal";



interface HotspotsTableProps {
  data: Hotspot[];
  onEdit: (hotspot: Hotspot) => void;
  onDelete: (id: string) => void;
}

// Sous-composant pour gérer l'état "Copié" proprement
const CopyableCode = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col group relative">
      <button
        onClick={handleCopy}
        className="relative inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold bg-purple-100 text-purple-800 font-mono tracking-wider hover:bg-purple-200 transition-colors cursor-pointer active:scale-95"
      >
        {code}

        {/* Tooltip */}
        <span className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded transition-opacity pointer-events-none whitespace-nowrap z-10 ${copied ? 'opacity-100 bg-emerald-600' : 'opacity-0 group-hover:opacity-100'}`}>
          {copied ? "Copié !" : "Cliquer pour copier"}
          <span className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${copied ? 'border-t-emerald-600' : 'border-t-gray-900'}`}></span>
        </span>
      </button>
      <span className="text-[10px] text-gray-400 mt-1">Code unique généré</span>
    </div>
  );
};

export default function HotspotsTable({ data, onEdit, onDelete }: HotspotsTableProps) {
  const router = useRouter();
  const [scriptHotspot, setScriptHotspot] = useState<Hotspot | null>(null);

  // 1. Définition des colonnes
  const columns: ColumnDef<Hotspot>[] = [
    {
      header: "Nom du Wifizone",
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
      header: "Code Wifizone",
      cell: (row) => {

        return row.ussdCode ? (
          <CopyableCode code={row.ussdCode} />
        ) : (
          <span className="text-xs text-gray-400 italic">En attente...</span>
        );
      },
    },
    {
      header: "Créé le",
      cell: (row) => new Date(row.createdAt).toLocaleDateString("fr-FR"),
    },
  ];

  const handleClose = () => {
    setScriptHotspot(null);
  };

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
        onClick={() => setScriptHotspot(row)} // Ouvre la modale
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition"
      >
        <FileCode size={16} />
        Script d'installation
      </button>
      <button
        onClick={() => router.push(`/admin/tickets/hotspots/${row.id}/logs`)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition"
      >
        <ShieldCheck size={16} />
        Logs & Conformité
      </button>
      <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
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
    <>
      <GenericTable
        data={data}
        columns={columns}
        searchPlaceholder="Rechercher par nom, lieu..."
        itemsPerPage={5}
        renderActions={renderActions}
      />
      {scriptHotspot && (
        <Modal
          title="Guide d'activation rapide"
          isOpen={!!scriptHotspot}
          onClose={handleClose}
          className="max-w-[700px] p-6 lg:p-10"
        >


          {/* <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"> */}

          {/* Header Modale */}
          {/* <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileCode className="text-brand-600" size={20} />
                  Configuration
                </h3>
                <button
                  onClick={() => setScriptHotspot(null)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div> */}

          {/* Corps Modale */}
          <div className="p-6">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe size={18} className="text-blue-500" />
              Étape 1 : Configuration du Point d'accès
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Copiez ce script et collez-le dans votre Mikrotik (System &gt; Scripts) pour activer la synchronisation automatique des tickets Kodfi sur <strong>{scriptHotspot.name}</strong>.
            </p>
            {/* Le composant générateur */}
            <ScriptGenerator
              hotspotUssd={scriptHotspot.ussdCode || ""}
              hotspotName={scriptHotspot.name}
              hotspotSecretKey={scriptHotspot.secretKey}
            />

            {/* Section Widget de Paiement */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" />
                Étape finale : Widget de Paiement
              </h4>

              <p className="text-xs text-gray-500 mb-3">
                Copiez cette ligne et collez-la juste avant la balise <code className="text-brand-600 font-bold">&lt;/body&gt;</code> dans le fichier <code className="font-bold">login.html</code> de votre MikroTik.
              </p>

              <div className="relative group">
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-[11px] font-mono overflow-x-auto border border-slate-700">
                  {
                    `<script 
                      src="${process.env.NEXT_PUBLIC_SITE_URL}/widget.js" 
                      data-ussd="${scriptHotspot.ussdCode}"
                      data-mac="\$(mac)"
                      data-ip="\$(ip)">
                    </script>`
                  }
                </pre>
                <button
                  onClick={() => {
                    const code = `<script src="${process.env.NEXT_PUBLIC_SITE_URL}/widget.js" data-ussd="${scriptHotspot.ussdCode}" data-mac="\$(mac)" data-ip="\$(ip)"></script>`;
                    navigator.clipboard.writeText(code);
                    alert("Widget copié !");
                  }}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-md transition"
                >
                  <FileCode size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Modale */}
          {/* <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end">
                <button
                  onClick={() => setScriptHotspot(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition"
                >
                  Fermer
                </button>
              </div> */}
          {/* </div>
          </div> */}
        </Modal>
      )}
    </>
  );
}