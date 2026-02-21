import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { Metadata } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Hotspot from "./Hotspot";

export const metadata: Metadata = {
  title: "Gestion des Hotspots | Kodfi",
  description: "Gérez vos points d'accès wifi",
};

export default async function HotspotsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) { redirect("/signin"); }

  const whereClause: any = { deletedAt: null };

  if (session.user.role === "PROVIDER") {
    whereClause.Owner= {
      email : session.user.email  
    }; 
  }

  const hotspots = await prisma.hotspot.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageBreadcrumb pageTitle="Wifizone" parentNode="Tickets" />
      </div>

      <Hotspot hotspots={hotspots}/>
    </div>
  );
}
