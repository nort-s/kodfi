"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // Important pour ApexCharts en Next.js
import { getBestSellingOffers } from "@/actions/stats-offers";
import { ApexOptions } from "apexcharts";

// ApexCharts ne supporte pas le SSR (Server Side Rendering), on l'importe dynamiquement
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function BestSellersChart() {
  const [period, setPeriod] = useState(1);
  const [chartData, setChartData] = useState<{ name: string; sales: number }[]>([]);

  useEffect(() => {
    getBestSellingOffers(period).then(setChartData);
  }, [period]);

  // Préparer les données pour ApexCharts
  const series = [{
    name: "Ventes",
    data: chartData.map(item => item.sales),
  }];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true, // Barres horizontales pour mieux lire les noms
        borderRadius: 4,
        barHeight: "50%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.map(item => item.name), // Noms des offres
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    colors: ["#3C50E0"], // Couleur primaire de ton template
    grid: {
      strokeDashArray: 5,
      xaxis: { lines: { show: true } },   
      yaxis: { lines: { show: false } }, 
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: function (val) {
          return val + " Tickets";
        },
      },
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-6">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-bold text-black dark:text-white">
            Top Offres Vendues
          </h4>
        </div>
        <div>
          <select 
            className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none dark:text-white"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={1}>24 Heures</option>
            <option value={7}>7 Jours</option>
            <option value={30}>30 Jours</option>
            <option value={90}>3 Mois</option>
          </select>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
}