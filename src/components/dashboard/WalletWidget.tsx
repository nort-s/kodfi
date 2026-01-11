"use client";
import React, { useEffect, useState } from "react";
import { getWalletData } from "@/actions/wallet";
import Link from "next/link";

export default function WalletWidget() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getWalletData().then((res) => !res.error && setData(res));
  }, []);

  if (!data) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {data.balance.toLocaleString()} FCFA
          </h4>
          <span className="text-sm font-medium text-gray-500">Solde Disponible</span>
        </div>
        
        <div className="text-right">
             <span className="text-xs text-gray-400 block mb-1">
            Gagné: {data.totalEarned.toLocaleString()}
          </span>
           <span className="text-xs text-gray-400 block">
            Retiré: {data.totalWithdrawn.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-4">
        {data.canWithdraw ? (
          <Link
            href="/admin/payouts/new" // Assure-toi que cette route existe
            className="flex w-full justify-center rounded bg-primary p-2 font-medium text-gray hover:bg-opacity-90"
          >
            Demander un retrait
          </Link>
        ) : (
          <button
            disabled
            className="flex w-full justify-center rounded bg-gray-300 p-2 font-medium text-gray-600 cursor-not-allowed dark:bg-meta-4"
          >
            Min. {data.minPayout} FCFA pour retirer
          </button>
        )}
      </div>
      
      {/* Barre de progression visuelle */}
      <div className="mt-4 relative h-1.5 w-full rounded-full bg-stroke dark:bg-strokedark">
        <div 
            className="absolute left-0 h-full rounded-full bg-primary" 
            style={{ width: `${Math.min((data.balance / data.minPayout) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}