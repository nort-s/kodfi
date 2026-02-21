"use client";

import { useState } from "react";
import { Copy, Download, Check, FileCode } from "lucide-react";
import { toast } from "react-hot-toast";

interface ScriptGeneratorProps {
    hotspotUssd: string;
    hotspotName: string;
    hotspotSecretKey: string;
}

export default function ScriptGenerator({ hotspotUssd, hotspotName, hotspotSecretKey }: ScriptGeneratorProps) {
    const [copied, setCopied] = useState(false);

    // On génère le script dynamiquement
    // window.location.origin permet d'avoir 'http://localhost:3000' en dev 
    // et 'https://kodfi.com' en prod automatiquement.
    const getScriptContent = () => {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

        return `# ==========================================
        # KODFI AUTO-SYNC SCRIPT
        # Hotspot: ${hotspotName}
        # ==========================================

        # 1. Configuration
        :local hotspotId "${hotspotUssd}"
        :local secretKey "${hotspotSecretKey}"
        :local apiUrl "${baseUrl}/api/hotspots/sync"

        # ==========================================
        # 2. Logique (NE PAS TOUCHER)
        # ==========================================
        :log info "Kodfi: Demarrage de la synchronisation..."

        :local jsonPayload "{\\"stocks\\":{"
        :local isFirst true

        /ip hotspot user profile foreach i in=[find where name~"^kodfi_"] do={
            :local profileName [get $i name]
            :local count [:len [/ip hotspot user find where profile=$profileName and comment=("kodfi_av_" . $profileName)]]
            :if ($isFirst = false) do={ :set jsonPayload ($jsonPayload . ",") }
            :set isFirst false
            :set jsonPayload ($jsonPayload . "\\"" . $profileName . "\\":" . $count)
        }

        :set jsonPayload ($jsonPayload . "}}")
        :log info ("Kodfi: Stock actuel -> " . $jsonPayload)

        :local fileName "kodfi_update.rsc"

        do {
            /tool fetch url=($apiUrl . "/" . $hotspotId . "/refill") \\
            http-method=post \\
            http-header-field="Content-Type: application/json,X-Kodfi-Secret: $secretKey" \\
            http-data=$jsonPayload \\
            check-certificate=no \\
            dst-path=$fileName
                
            :local fileSize [:len [/file find name=$fileName]]
            
            :if ($fileSize > 0) do={
                :log info "Kodfi: Mise a jour recue. Execution..."
                /import $fileName
                :log info "Kodfi: Mise a jour terminee."
            } else={
                :log info "Kodfi: Stock complet."
            }
            
            /file remove $fileName

        } on-error={
            :log error "Kodfi: Erreur de connexion au serveur."
        }
        `;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getScriptContent());
        setCopied(true);
        toast.success("Script copié !");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([getScriptContent()], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `kodfi_install_${hotspotUssd}.rsc`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
        toast.success("Téléchargement lancé !");
    };

    return (
        <div className="bg-gray-900 text-gray-300 rounded-lg p-4 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                    <FileCode size={20} className="text-brand-500" />
                    <span>Script d'Installation Mikrotik</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 rounded-md transition border border-gray-600"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {copied ? "Copié" : "Copier"}
                    </button>

                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-md transition"
                    >
                        <Download size={14} />
                        Télécharger .rsc
                    </button>
                </div>
            </div>

            <div className="bg-black/50 p-3 rounded-md font-mono text-xs overflow-x-auto border border-gray-800">
                <pre className="whitespace-pre-wrap break-all text-gray-400">
                    {`# Script pour ${hotspotName} (ID: ${hotspotUssd})`}
                    <br />
                    {`:local hotspotId "${hotspotUssd}"`}
                    <br />
                    ... (Le reste du script est généré automatiquement)
                </pre>
            </div>

            <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                <span className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">Info</span>
                Copiez ce script dans System &gt; Scripts sur votre Mikrotik.
            </div>
        </div>
    );
};