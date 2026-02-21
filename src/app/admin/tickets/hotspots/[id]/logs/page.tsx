"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Search, ShieldCheck, Smartphone, Monitor, Download } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

// Définition du type (adapter selon ton Prisma Client généré)
interface LogEntry {
  id: string;
  phone: string | null;
  macAddress: string | null;
  ipAddress: string | null;
  action: string;
  details: string | null;
  createdAt: string;
}

export default function AccessLogsPage() {
  const params = useParams();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les logs (On fera l'API juste après)
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`/api/hotspots/${params.id}/logs`);
        const data = await res.json();
        setLogs(data);
      } catch (e) {
        console.error("Erreur logs", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [params.id]);

  // Filtrage local
  const filteredLogs = logs.filter(log => 
    (log.phone?.includes(searchTerm) || false) ||
    (log.macAddress?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (log.details?.includes(searchTerm) || false)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-brand-600" />
            Journal de Conformité (ARCEP)
          </h1>
          <p className="text-sm text-gray-500">
            Historique des connexions et identifications pour les autorités.
          </p>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Rechercher MAC, Tél..." 
                className="pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 w-full md:w-64 focus:ring-2 focus:ring-brand-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-gray-500">Chargement des traces...</div>
        ) : filteredLogs.length === 0 ? (
           <div className="p-8 text-center text-gray-500">Aucun journal d'accès pour le moment.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-3">Date & Heure</th>
                <th className="px-6 py-3">Utilisateur</th>
                <th className="px-6 py-3">Appareil (MAC)</th>
                <th className="px-6 py-3">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(log.createdAt).toLocaleString("fr-BJ")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-gray-400" />
                        <span className="font-mono font-medium text-gray-900 dark:text-white">
                            {log.phone || "Inconnu"}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-gray-400" />
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {log.macAddress || "Non capturé"}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {log.action === "LOGIN_SUCCESS" ? (
                        <Badge size="sm" color="success">Connexion Réussie</Badge>
                    ) : (
                        <span className="text-xs">{log.action}</span>
                    )}
                    {log.details && <span className="ml-2 text-xs text-gray-400">({log.details})</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}