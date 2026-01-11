// src/lib/phone-utils.ts

 // Liste non exhaustive, à mettre à jour selon l'ARCEP
  const mtnPrefixes = ["51", "52", "53", "54", "56", "57", "59", "61", "62", "66", "67", "69", "90", "91", "96", "97"];
  const moovPrefixes = ["45", "46", "55", "58", "60", "63", "64", "65", "68", "85", "94", "95", "98", "99"];
  const celtiisPrefixes = ["40", "41", "42", "43", "44"];

/**
 * Nettoie et valide un numéro béninois.
 * Accepte: 0197000000, 97000000, +22997000000
 * Retourne le format: 2290197000000 ou null si invalide.
 */
export function normalizeBeninPhone(phone: string): string | null {
  // 1. Enlever tout ce qui n'est pas chiffre
  const cleaned = phone.replace(/\D/g, "");

  // Gestion des formats
  // 002290166000000
  if (cleaned.startsWith("00229") && cleaned.length === 15) {
    return cleaned.substring(2);
  }

  // 0022966000000
  if (cleaned.startsWith("00229") && cleaned.length === 13) {
    return "22901" + cleaned.substring(5);
  }

  // 2290166000000
  if (cleaned.startsWith("229") && cleaned.length === 13) {
    return cleaned;
  }

  // 22966000000
  if (cleaned.startsWith("229") && cleaned.length === 11) {
    return "22901" + cleaned.substring(3);
  }

  // 0166000000
  if (cleaned.startsWith("01") && cleaned.length === 10) {
    return "229" + cleaned;
  }

  // 66000000
  if (cleaned.length === 8) {
    const prefix = cleaned.substring(0, 2);

    if (mtnPrefixes.includes(prefix) || moovPrefixes.includes(prefix) || celtiisPrefixes.includes(prefix))
      return "22901" + cleaned;
  }

  return null; // Numéro invalide
}

/**
 * Vérifie l'opérateur (Optionnel, pour info)
 */
export function getBeninOperator(phone: string): "MTN" | "MOOV" | "CELTIIS" | "UNKNOWN" {
  const normalized = normalizeBeninPhone(phone);
  if (!normalized) return "UNKNOWN";

  const prefix = normalized.substring(5, 7); // Les 2 chiffres après 22901

  if (mtnPrefixes.includes(prefix)) return "MTN";
  if (moovPrefixes.includes(prefix)) return "MOOV";
  if (celtiisPrefixes.includes(prefix)) return "CELTIIS";

  return "UNKNOWN";
}