"use client";
import React, { useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { changePassword } from "@/actions/change-password";
import toast from "react-hot-toast";

export default function UserSecurityCard() {
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour les champs
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation basique Côté Client
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    // 2. Appel Server Action
    const result = await changePassword({
      currentPassword,
      newPassword,
    });

    if (result.success) {
      toast.success("Mot de passe modifié avec succès !");
      // On vide les champs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Sécurité & Mot de passe
          </h4>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:w-[400px]">
              
              {/* Mot de passe actuel */}
              <div>
                <Label>Mot de passe actuel</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="********"
                />
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                />
              </div>

              {/* Confirmation */}
              <div>
                <Label>Confirmer le nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                />
              </div>

              <div className="pt-2">
                <Button size="sm" disabled={isLoading}>
                  {isLoading ? "Modification..." : "Modifier le mot de passe"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}