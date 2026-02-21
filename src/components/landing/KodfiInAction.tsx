"use client";

import { useState } from "react";
import {
  Settings,
  ShieldCheck,
  CreditCard,
  BarChart3,
  CheckCircle, // Disponible dans lucide-react
  ArrowRight
} from "lucide-react";
import Image from "next/image";

export default function KodfiInAction() {
  const [activeTab, setActiveTab] = useState("offers");

  const tabs = [
    { id: "offers", label: "Gestion", icon: <Settings size={20} /> },
    { id: "stats", label: "Revenus", icon: <BarChart3 size={20} /> },
    { id: "logs", label: "Sécurité", icon: <ShieldCheck size={20} /> },
    { id: "withdrawals", label: "Retraits", icon: <CreditCard size={20} /> },
  ];

  const content = {
    offers: {
      title: "Gestion Intelligente des Offres",
      desc: "Configurez vos tarifs une seule fois. Kodfi communique avec votre MikroTik pour créer les profils et gérer les accès automatiquement.",
      features: ["Création automatique de profils MikroTik", "Zéro gestion manuelle de tickets", "Activation instantanée après paiement"],
      color: "blue"
    },
    stats: {
      title: "Analyse des Revenus en Temps Réel",
      desc: "Suivez chaque franc qui entre dans votre business. Visualisez vos performances par hotspot et par période.",
      features: ["Tableau de bord financier clair", "Comparaison entre hotspots", "Rapports d'activité quotidiens"],
      color: "brand"
    },
    logs: {
      title: "Conformité ARCEP & Sécurité",
      desc: "Dormez tranquille. Nous enregistrons les preuves de connexion (MAC, IP, Tél) pour vous garder en règle avec les autorités.",
      features: ["Archivage automatique des sessions", "Recherche par adresse MAC ou Tél", "Protection juridique incluse"],
      color: "emerald"
    },
    withdrawals: {
      title: "Retraits MoMo Instantanés",
      desc: "Votre argent est disponible immédiatement. Demandez un retrait vers votre compte Mobile Money en un clic.",
      features: ["Virement direct vers MTN ou Moov", "Historique de retrait transparent", "Aucun frais caché sur les transferts"],
      color: "orange"
    }
  };

  const active = content[activeTab as keyof typeof content];

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Un outil de niveau <span className="text-brand-600">professionnel</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-medium">
            Pourquoi les gérants sérieux au Bénin choisissent Kodfi pour passer à l'échelle.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-4 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row gap-12 items-center">

          {/* GAUCHE: TEXTE ET TABS */}
          <div className="flex-1 space-y-8">
            {/* Onglets */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all ${activeTab === tab.id
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenu */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">{active.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{active.desc}</p>

              <ul className="space-y-4">
                {active.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 font-semibold text-gray-700">
                    <div className="bg-emerald-100 p-1 rounded-full text-emerald-600">
                      <CheckCircle size={16} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <button className="flex items-center gap-2 text-brand-600 font-bold hover:gap-4 transition-all">
                Voir comment ça marche <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* DROITE: VISUEL DASHBOARD */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative aspect-video lg:aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-800 group">
              {/* Overlay dégradé pour faire "Tech" */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/40 to-transparent z-10"></div>

              {/* Ici, on simule l'interface ou on met une image */}
              <div className="absolute inset-0 flex items-center justify-center p-8 text-white/20">
                {/* Icône géante en arrière-plan pour le style quand l'image charge */}
                {activeTab === 'offers' && <Settings size={200} strokeWidth={1} />}
                {activeTab === 'stats' && <BarChart3 size={200} strokeWidth={1} />}
                {activeTab === 'logs' && <ShieldCheck size={200} strokeWidth={1} />}
                {activeTab === 'withdrawals' && <CreditCard size={200} strokeWidth={1} />}
              </div>

              {/* Remplacer par ton <Image /> une fois tes captures prêtes */}
              <div className="absolute inset-4 bg-slate-800 rounded-xl border border-slate-700 flex flex-col p-4 overflow-hidden">
                <div className="relative w-full h-auto shadow-xl rounded-xl overflow-hidden z-10 transform transition-transform duration-500 group-hover:scale-[1.02]">
                  {activeTab === 'offers' &&


                    <Image
                      src="/images/mockups/revenus.png" // Ton fichier image
                      alt="Dashboard des revenus Kodfi"
                      width={1200} // Largeur originale de l'image
                      height={800} // Hauteur originale de l'image
                      className="w-full h-auto" // S'adapte à la largeur du parent, hauteur auto
                      priority // Charge en priorité
                    />}
                    {/* <Image
                    src="/images/mockups/revenus.png" // Ton fichier image
                    alt="Dashboard des revenus Kodfi"
                    width={1200} // Largeur originale de l'image
                    height={800} // Hauteur originale de l'image
                    className="w-full h-auto" // S'adapte à la largeur du parent, hauteur auto
                    priority // Charge en priorité
                    /> */}
                </div>


                {/* <div className="w-full h-8 bg-slate-700 rounded-lg mb-4 flex gap-2 p-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                    <div className="h-4 w-full bg-slate-700 rounded opacity-50"></div>
                    <div className="h-20 w-full bg-brand-600/20 border border-brand-500/30 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-24 bg-slate-700 rounded-lg"></div>
                      <div className="h-24 bg-slate-700 rounded-lg"></div>
                    </div>
                  </div> */}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}