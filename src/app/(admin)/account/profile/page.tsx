import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserSecurityCard from "@/components/user-profile/UserSecurityCard";

export const metadata: Metadata = {
  title: "Mon Profil | Kodfi",
};

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  return user;
}

export default async function Profile() {
  const user = await getUser();

  if (!user) return <div className="p-6">Non connecté</div>;

  // ✅ PLUS BESOIN DE SPLIT. On récupère directement.
  // Note: user.firstname (minuscule) vient de ta DB
  const firstNameStr = user.firstname || ""; 
  const lastNameStr = user.lastname || "";

  const userInfoData = {
    firstName: firstNameStr,
    lastName: lastNameStr,
    email: user.email,
    phone: user.phone || "",
    bio: user.bio || "",
  };

  const addressData = {
    country: user.country || "",
    cityState: user.cityState || "",
    postalCode: user.postalCode || "",
    taxId: user.taxId || "",
  };

  const metaData = {
    firstName: firstNameStr,
    lastName: lastNameStr,
    bio: user.bio || "Membre",
    location: user.cityState || "Localisation inconnue"
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Mon Profil
        </h3>
        <div className="space-y-6">
          <UserMetaCard data={metaData} />
          <UserInfoCard data={userInfoData} />
          <UserAddressCard data={addressData} />
          <UserSecurityCard />
        </div>
      </div>
    </div>
  );
}