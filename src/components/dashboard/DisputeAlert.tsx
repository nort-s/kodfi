"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function DisputeAlert({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-900/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800 dark:text-red-200">
              Action requise : {count} Litige{count > 1 ? "s" : ""} client en cours
            </h3>
            <p className="mt-1 text-xs text-red-600 dark:text-red-300">
              Des clients ont payé mais n'ont pas reçu de code (Stock vide).
              Les retraits sont bloqués tant que ce n'est pas résolu.
            </p>
          </div>
        </div>

        <Link
          href="/admin/notifications"
          className="group flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Résoudre maintenant
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}