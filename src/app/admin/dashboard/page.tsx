import type { Metadata } from "next";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import React from "react";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import DisputeAlert from "@/components/dashboard/DisputeAlert"; // Importe le widget
    // import { auth } from "@/api/auth/[...nextauth]/route"

import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default async function Ecommerce() {

//   const session = await auth()

  const session = await getServerSession(authOptions);
  // console.log(session)

  if (!session || !session.user?.email) {
    redirect('/signin')
  }

  const user = await prisma.user.findUnique({ 
      where: { email: session.user.email },
      select: { id: true }
  });

  if (!user) return null;

//   const openDisputesCount = await prisma.dispute.count({
//     where: {
//       Hotspot: { ownerId: user.id }, // On filtre par les hotspots du gérant
//       status: "OPEN"                 // Uniquement ceux non résolus
//     }
//   });

//   return (
//     <>
//       <DisputeAlert count={openDisputesCount} />
//     <div className="grid grid-cols-12 gap-4 md:gap-6">
      
//       <div className="col-span-12">
//         Vous pourrez bientôt obtenir des données de vos ventes.
//       </div>
//       {/* <div className="col-span-12 space-y-6 xl:col-span-7">
//         <EcommerceMetrics />

//         <MonthlySalesChart />
//       </div>

//       <div className="col-span-12 xl:col-span-5">
//         <MonthlyTarget />
//       </div>

//       <div className="col-span-12">
//         <StatisticsChart />
//       </div>

//       <div className="col-span-12 xl:col-span-5">
//         <DemographicCard />
//       </div>

//       <div className="col-span-12 xl:col-span-7">
//         <RecentOrders />
//       </div> */}


//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
//         {/* ... Tes Cards existantes (Revenus, Ventes, etc.) ... */}
//       </div>

//       <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
//         {/* ... Tes Graphiques ... */}
//       </div>
//     </div>
//     </>
    
//   );
}
