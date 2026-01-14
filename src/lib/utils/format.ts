export function formatOfferDuration(duration: number, unit: string, short = true) {
  const units: Record<string, { short: string; long: string }> = {
    MINUTES: { short: "min", long: "Minute(s)" },
    HOURS: { short: "Hrs", long: "Heure(s)" },
    DAYS: { short: "Jrs", long: "Jour(s)" },
    MONTHS: { short: "Mois", long: "Mois" },
  };
  console.log(unit)

  const label = units[unit] || { short: "", long: "" };
  const suffix = short ? label.short : label.long;

  return `${duration} ${suffix}`;
}