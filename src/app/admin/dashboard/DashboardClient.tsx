"use client";

import React, { useEffect, useState } from "react";
import { getDashboardStats } from "@/actions/get-dashboard-stats";
// Tu auras besoin d'un chart (Recharts est super), installe-le si besoin : npm i recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WalletWidget from "@/components/dashboard/WalletWidget";
import { EcommerceMetrics } from "@/app/admin/dashboard/widgets/EcommerceMetrics";

import { getGrowthStats } from "@//actions/get-growth-stats";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [ecommerceMetrics, setEcommerceMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getDashboardStats();
      if (!data.error) {
        setStats(data);
      }
      const data2 = await getGrowthStats();
      if (data2) {
        setEcommerceMetrics(data2);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Chargement du tableau de bord...</div>;
  if (!stats || !ecommerceMetrics ) return <div className="p-6">Erreur de chargement.</div>;

  return (
    <>
      {/* <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics data={ecommerceMetrics} />

          {/* <MonthlySalesChart />
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> 

      </div> */}
      <div className="md:p-6 2xl:p-10">


        {/* --- GRILLE DES KPIs --- */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          <CardDataStats title="Revenu Total" total={`${stats.totalRevenue} FCFA`} rate="Total">
            <DollarIcon />
          </CardDataStats>

          <CardDataStats title="Total Commandes" total={stats.totalOrders} rate="Ventes">
            <CartIcon />
          </CardDataStats>

          <CardDataStats title="Codes Actifs" total={stats.activeCodes} rate="En cours">
            <TicketIcon />
          </CardDataStats>

          <CardDataStats title="Mes Hotspots" total={stats.totalHotspots} rate="Sites">
            <WifiIcon />
          </CardDataStats>

          <WalletWidget />
        </div>

        {/* --- SECTION GRAPHIQUE & TABLEAU --- */}
        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">

          {/* GRAPHIQUE (Prend 8 colonnes sur grand écran) */}
          <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
              Revenus de la semaine
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3C50E0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DERNIÈRES COMMANDES (Prend 4 colonnes) */}
          <div className="col-span-12 rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
            <h4 className="mb-6 text-xl font-bold text-black dark:text-white">
              Dernières Ventes
            </h4>
            <div className="flex flex-col gap-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500">Aucune vente récente.</p>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-stroke pb-2 last:border-0 dark:border-strokedark">
                    <div>
                      <h5 className="font-medium text-black dark:text-white">
                        {order.amount} FCFA
                      </h5>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.hotspotName}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                      Payé
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- PETITS COMPOSANTS UI POUR EVITER LES IMPORTS COMPLEXES ---

const CardDataStats = ({ title, total, rate, children }: any) => (
  <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
      {children}
    </div>
    <div className="mt-4 flex items-end justify-between">
      <div>
        <h4 className="text-title-md font-bold text-black dark:text-white">
          {total}
        </h4>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
        {rate}
      </span>
    </div>
  </div>
);

// Icônes SVG simplifiées
const DollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Z"></path><path d="M10 9v6"></path><path d="M14 9v6"></path></svg>;
const WifiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>;