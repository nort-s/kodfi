"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Hotspot } from '../../../../../prisma/generated/client'

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

// Schéma de validation
const hotspotSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    location: z.string().optional(),
    redirectUrl: z.string().url("URL invalide (ex: https://google.com)").optional().or(z.literal("")),
});

type HotspotFormValues = z.infer<typeof hotspotSchema>;

interface HotspotFormProps {
    onSuccess: () => void;
    initialData?: Hotspot | null; // Si présent = Mode Édition
}

export default function HotspotForm({ onSuccess, initialData }: HotspotFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<HotspotFormValues>({
        resolver: zodResolver(hotspotSchema),
        defaultValues: {
            name: initialData?.name || "",
            location: initialData?.location || "",
            redirectUrl: initialData?.redirectUrl || "",
        },
    });

    const onSubmit = async (data: HotspotFormValues) => {
        setIsLoading(true);
        try {
            if (initialData) {
                // --- MODE EDITION (PATCH) ---
                await axios.patch(`/api/hotspots/${initialData.id}`, data);
                toast.success("Hotspot modifié avec succès");
            } else {
                // --- MODE CREATION (POST) ---
                await axios.post("/api/hotspots", data);
                toast.success("Hotspot créé avec succès");
            }

            router.refresh(); // Rafraîchit les données de la page sans recharger
            onSuccess(); // Ferme le modal
        } catch (error) {
            console.error(error);
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nom */}
            <div>
                <Label>Nom du Wifizone <span className="text-red-500">*</span></Label>
                <Input
                    placeholder="Ex: Wifi Restaurant"
                    {...register("name")}
                    error={!!errors.name}
                    hint={errors.name?.message}
                />
            </div>

            {/* Emplacement */}
            <div>
                <Label>Emplacement (Optionnel)</Label>
                <Input
                    placeholder="Ex: Etage 1, Terrasse..."
                    {...register("location")}
                />
            </div>

            {/* URL de redirection */}
            <div>
                <Label>URL de redirection (Optionnel)</Label>
                <Input
                    placeholder="https://votre-site.com"
                    {...register("redirectUrl")}
                    error={!!errors.redirectUrl}
                    hint={errors.redirectUrl?.message}
                />
                <p className="text-xs text-gray-500 mt-1">
                    L'utilisateur sera redirigé ici après connexion.
                </p>
            </div>



            {/* Bouton Submit */}
            <div className="flex justify-end pt-2">
                <Button disabled={isLoading} size="sm">
                    {isLoading ? "Enregistrement..." : initialData ? "Modifier" : "Créer le Hotspot"}
                </Button>
            </div>
        </form>
    );
}