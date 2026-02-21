// src/lib/mikrotik.ts
import { DurationUnit } from "@/lib/prisma";

export function formatMikrotikDuration(duration: number, unit: DurationUnit): string {
  // Mikrotik accepte le format : 00:00:00 (H:M:S) ou Xd (jours)
  
  if (unit === "MINUTES") {
    // Si < 60 min, on gère les minutes
    // Pour simplifier, on peut tout convertir en format H:M:S
    const h = Math.floor(duration / 60);
    const m = duration % 60;
    return `${pad(h)}:${pad(m)}:00`;
  }
  
  if (unit === "HOURS") {
    return `${pad(duration)}:00:00`;
  }
  
  if (unit === "DAYS") {
    return `${duration}d 00:00:00`; // ex: 1d 00:00:00
  }

  if (unit === "MONTHS") {
    return `${duration * 30}d 00:00:00`; // Approximation 30 jours
  }

  return "01:00:00"; // Fallback
}

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}