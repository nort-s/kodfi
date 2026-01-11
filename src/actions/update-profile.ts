"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  country?: string;
  cityState?: string;
  postalCode?: string;
  taxId?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  error?: string;
}

export async function updateProfile(data: ProfileData): Promise<UpdateProfileResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        // ✅ ON MAPPE DIRECTEMENT (Attention aux minuscules de ta DB)
        firstname: data.firstName, 
        lastname: data.lastName,
        
        phone: data.phone,
        bio: data.bio,
        country: data.country,
        cityState: data.cityState,
        postalCode: data.postalCode,
        taxId: data.taxId,
      },
    });

    revalidatePath("/settings/profile");
    return { success: true };

  } catch (error) {
    console.error("Erreur update profil:", error);
    return { success: false, error: "Erreur technique." };
  }
}