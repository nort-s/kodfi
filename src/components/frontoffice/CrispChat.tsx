"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export default function CrispChat() {
  useEffect(() => {
    // Remplace par ton VRAI Website ID que tu viens de copier
    Crisp.configure("TON_WEBSITE_ID_ICI");
  }, []);

  return null; // Ce composant n'affiche rien visuellement, il charge juste le script
}