"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Vérifie ton chemin
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(data: ChangePasswordData) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return { success: false, error: "Non connecté" };
  }

  try {
    // 1. Récupérer l'utilisateur pour avoir son hash actuel
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      return { 
        success: false, 
        error: "Utilisateur introuvable ou connecté via Google/Facebook." 
      };
    }

    // 2. Vérifier si l'ancien mot de passe est bon
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);

    if (!isMatch) {
      return { success: false, error: "Le mot de passe actuel est incorrect." };
    }

    // 3. Vérifier la complexité (optionnel, ici min 6 caractères)
    if (data.newPassword.length < 6) {
      return { success: false, error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
    }

    // 4. Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // 5. Mise à jour en base
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true };

  } catch (error) {
    console.error("Erreur changement mot de passe:", error);
    return { success: false, error: "Erreur technique." };
  }
}