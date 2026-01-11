// src/lib/sms-service.ts
import { prisma } from "@/lib/prisma";

interface SmsPayload {
  to: string;
  message: string;
  userId?: string; // Optionnel : pour lier le log au provider
}

export async function sendSms({ to, message, userId }: SmsPayload) {
  // 1. Simuler l'envoi (Remplacer par fetch vers API SMS plus tard)
  console.log(`[SMS MOCK] Envoi à ${to} : "${message}"`);
  
  const success = true; // Simuler succès

  // 2. Sauvegarder dans la DB comme Notification ou Log (Historique)
  if (userId) {
    await prisma.notification.create({
      data: {
        userId,
        title: "SMS Envoyé",
        message: `Dest: ${to} | Contenu: ${message}`,
        type: "INFO",
        isRead: true
      }
    });
  }

  return success;
}

// --- FONCTIONS METIER ---

// Cas 1 : Envoi du Code au Client
export async function sendCodeToClient(phone: string, code: string, duration: string) {
  const msg = `KODFI: Votre code WiFi est ${code}. Validité: ${duration}. Merci!`;
  return await sendSms({ to: phone, message: msg });
}

// Cas 2 : Alerte Litige au Provider
export async function sendDisputeAlert(providerPhone: string, amount: number) {
  const msg = `KODFI ALERTE: Un litige de ${amount} FCFA a été ouvert sur un de vos tickets. Vérifiez votre dashboard.`;
  return await sendSms({ to: providerPhone, message: msg });
}

// Cas 3 : Alerte Retrait (Litige/Problème) à l'Admin
// Tu devras mettre ton numéro d'admin dans une variable d'env
export async function sendAdminAlert(details: string) {
  const adminPhone = process.env.ADMIN_PHONE || "22900000000"; 
  const msg = `ADMIN ALERTE: Problème retrait. ${details}`;
  return await sendSms({ to: adminPhone, message: msg });
}