"use client";

import { useState, useEffect } from "react";
import {
    AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp,
    MessageSquare, RefreshCcw, Search
} from "lucide-react";
import toast from "react-hot-toast";
import { resolveDisputeWithCode } from "@/actions/resolve-dispute";
import { Send, Check, Loader2 } from "lucide-react";

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    metadata: any;
    isRead: boolean;
    createdAt: string;
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Action: Marquer comme traité (Disparition des boutons)
    const handleMarkAsRead = async (id: string, actionName: string) => {
        // Optimistic UI Update (On met à jour l'interface tout de suite)
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

        toast.success(`Action "${actionName}" effectuée !`);

        // Appel API en background
        await fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
    };

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'UNREAD') return !n.isRead;
        return true;
    });

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Centre de Notifications</h1>
                    <p className="text-gray-500 text-sm mt-1">Gérez les alertes et les actions requises.</p>
                </div>

                {/* Filtres */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'ALL' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Toutes
                    </button>
                    <button
                        onClick={() => setFilter('UNREAD')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'UNREAD' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        À traiter
                    </button>
                </div>
            </div>

            {/* Liste */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 py-10">Chargement...</p>
                ) : filteredNotifs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Tout est calme</h3>
                        <p className="text-gray-500">Aucune notification à afficher pour le moment.</p>
                    </div>
                ) : (
                    filteredNotifs.map((notif) => (
                        <NotificationCard
                            key={notif.id}
                            notif={notif}
                            onAction={handleMarkAsRead}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// --- SOUS-COMPOSANT CARD ---
// ... imports et début du fichier identiques ...

function NotificationCard({ notif, onAction }: { notif: Notification, onAction: (id: string, action: string) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // On récupère l'ID du litige
    const disputeId = (notif.metadata as any)?.disputeId;
    const isLongMessage = notif.message.length > 100;

    const handleDeliverCode = async () => {
        if (!disputeId) return;
        
        if(!confirm(`Confirmez-vous l'envoi d'un code au client ? Assurez-vous d'avoir ajouté des tickets dans le stock avant de cliquer.`)) return;
        
        setIsProcessing(true);
        const result = await resolveDisputeWithCode(disputeId);
        setIsProcessing(false);

        if ("success" in result) {
            toast.success(`Succès ! Code ${result.code} envoyé au ${result.phone}`);
            onAction(notif.id, "Résolu"); 
        } else {
            toast.error(result.error || "Erreur technique");
        }
    };

    return (
        <div className={`group relative bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${!notif.isRead ? 'border-l-4 border-l-red-500 shadow-sm' : 'border-gray-200 opacity-75'}`}>
            
            <div className="flex gap-4 items-start">
                <div className={`mt-1 p-2 rounded-full shrink-0 ${notif.type === 'ALERT' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {notif.type === 'ALERT' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className={`text-base font-bold ${notif.type === 'ALERT' ? 'text-red-700' : 'text-gray-900'}`}>
                            {notif.title}
                        </h4>
                        <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap ml-2">
                            <Clock size={12} />
                            {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className={`mt-1 text-gray-600 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                        {notif.message}
                    </div>

                    {isLongMessage && (
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs font-medium text-brand-600 mt-1 flex items-center gap-1 hover:underline"
                        >
                            {expanded ? ( <><ChevronUp size={12}/> Réduire</> ) : ( <><ChevronDown size={12}/> Lire la suite</> )}
                        </button>
                    )}

                    {/* ZONE D'ACTIONS */}
                    {!notif.isRead && notif.type === 'ALERT' && (
                        <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                            
                            {/* Cas 1 : C'est un LITIGE (disputeId existe) */}
                            {disputeId ? (
                                <button 
                                    onClick={handleDeliverCode}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <Send size={16} />}
                                    {isProcessing ? "Traitement..." : "Résoudre : Livrer un code"}
                                </button>
                            ) : (
                                /* Cas 2 : C'est une autre alerte (sans litige financier) -> On peut ignorer */
                                <button 
                                    onClick={() => onAction(notif.id, "Lu")}
                                    className="ml-auto text-xs text-gray-400 underline hover:text-gray-600"
                                >
                                    J'ai compris (Marquer lu)
                                </button>
                            )}

                            {/* Note : Si c'est un litige, on n'affiche PAS le bouton ignorer. 
                                L'utilisateur est obligé de cliquer sur "Résoudre". */}
                        </div>
                    )}
                    
                    {notif.isRead && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium">
                            <CheckCircle size={12} /> Traité
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}