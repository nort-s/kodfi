"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

// Type pour nos données
type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Charger les données au montage
  useEffect(() => {
    fetchNotifications();
    
    // Optionnel : Rafraîchir toutes les 60 secondes
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Erreur chargement notifs", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Marquer comme lu quand on ouvre
  const handleToggle = async () => {
    setIsOpen(!isOpen);
    
    if (!isOpen && unreadCount > 0) {
        // Si on ouvre, on marque tout comme lu visuellement (et appel API en background)
        setUnreadCount(0);
        await fetch("/api/notifications", { method: "PUT" });
        // On rafraichit la liste pour mettre à jour les statuts isRead
        fetchNotifications(); 
    }
  };

  function closeDropdown() {
    setIsOpen(false);
  }

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleToggle}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-red-500 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        
        {/* Icône Cloche */}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[80px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h5>
          <button
            onClick={handleToggle}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
           {/* Close Icon */}
           <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          
          {loading && (
            <li className="text-center p-4 text-gray-500 text-sm">Chargement...</li>
          )}

          {!loading && notifications.length === 0 && (
            <li className="text-center p-8 text-gray-500 text-sm flex flex-col items-center">
                <span className="text-2xl mb-2">😴</span>
                Aucune notification pour le moment.
            </li>
          )}

          {notifications.map((notif) => (
            <li key={notif.id}>
              <DropdownItem
                onItemClick={closeDropdown}
                className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${!notif.isRead ? 'bg-orange-50 dark:bg-white/10' : ''}`}
              >
                {/* Icône d'alerte (Remplace l'image utilisateur) */}
                <span className={`relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${notif.type === 'ALERT' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                    {notif.type === 'ALERT' ? (
                        // Warning Icon
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    ) : (
                        // Info Icon
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    )}
                </span>

                <span className="block">
                  <span className="mb-1.5 block space-y-1 text-theme-sm text-gray-500 dark:text-gray-400">
                    <span className={`font-bold block ${notif.type === 'ALERT' ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>
                      {notif.title}
                    </span>
                    <span className="text-xs">
                       {notif.message}
                    </span>
                  </span>

                  <span className="flex items-center gap-2 text-gray-400 text-theme-xs">
                    <span>{formatDate(notif.createdAt)}</span>
                  </span>
                </span>
                
                {/* Petit point indicateur si non lu */}
                {!notif.isRead && (
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                )}
              </DropdownItem>
            </li>
          ))}
        </ul>

        <Link
          href="/notifications" // Tu pourras créer cette page plus tard
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Voir tout
        </Link>
      </Dropdown>
    </div>
  );
}