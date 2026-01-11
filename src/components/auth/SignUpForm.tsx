"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import  LoginButtons from "./commons/LoginButtons";


import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField"; // Assure-toi que ce composant accepte {...register}
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { normalizeBeninPhone } from "@/lib/phone-utils";

// 1. Définition du schéma de validation (Zod)
const signUpSchema = z.object({
  firstname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide").refine( (val) => !!normalizeBeninPhone(val), {message: "Format invalide"}), // Ajouté car requis dans Prisma
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions",
  }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // 2. Initialisation du hook de formulaire
  const {
    register,
    handleSubmit,
    setValue, // Nécessaire pour le Checkbox personnalisé
    watch, // Pour observer l'état du checkbox
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      terms: false,
    },
  });

  // 3. Fonction de soumission
  const onSubmit = async (data: SignUpFormValues) => {
    try {
      // Remplace l'URL par ton endpoint réel (ex: NestJS ou Next API)
      const response = await axios.post("/api/auth/register", {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "PROVIDER", // Par défaut lors de l'inscription via ce form
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Compte créé avec succès !");
        router.push("/signin"); // Redirection vers le login
      }
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Une erreur est survenue";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Page d'accueil
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Créer un compte
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrez vos informations pour commencer à vendre du Wifi !
            </p>
          </div>
          
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
               <LoginButtons />
            </div>

            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Ou avec email
                </span>
              </div>
            </div>

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* */}
                  <div className="sm:col-span-1">
                    <Label>
                      Prénom<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Votre prénom"
                      error={!!errors.firstname}
                      hint={errors.firstname?.message}
                      {...register("firstname")}
                      // Si ton composant Input ne gère pas l'erreur visuellement, ajoute une classe conditionnelle ici
                      className={errors.firstname ? "border-red-500" : ""}
                    />
                    {errors.firstname && <p className="text-xs text-red-500 mt-1">{errors.firstname.message}</p>}
                  </div>
                  {/* */}
                  <div className="sm:col-span-1">
                    <Label>
                      Nom<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Votre nom"
                      error={!!errors.lastname}
                      hint={errors.lastname?.message}
                      {...register("lastname")}
                    />
                    {errors.lastname && <p className="text-xs text-red-500 mt-1">{errors.lastname.message}</p>}
                  </div>
                </div>

                {/* */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="exemple@email.com"
                      error={!!errors.email}
                      hint={errors.email?.message}
                    {...register("email")}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                {/* */}
                <div>
                  <Label>
                    Téléphone<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="ex: 0197000000"
                    error={!!errors.phone}
                    hint={errors.phone?.message}
                    {...register("phone")}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                </div>
                {/* */}
                <div>
                  <Label>
                    Mot de passe<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="******"
                      type={showPassword ? "text" : "password"}
                      error={!!errors.password}
                      hint={errors.password?.message}
                      {...register("password")}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                {/* */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                    <Checkbox
                        className="w-5 h-5"
                        // Gestion manuelle pour le composant Checkbox personnalisé
                        checked={watch("terms")}
                        onChange={(checked) => setValue("terms", checked as boolean, { shouldValidate: true })}
                    />
                    <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                        En créant un compte, j'accepte les{" "}
                        <span className="text-gray-800 dark:text-white/90">
                        Termes et Conditions
                        </span>
                    </p>
                    </div>
                    {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}
                </div>

                {/* */}
                <div>
                  <button 
                    disabled={isSubmitting}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Création en cours..." : "S'inscrire"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Déjà un compte ?{" "}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}