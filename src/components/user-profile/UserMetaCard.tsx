"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
// 👇 Assure-toi que le chemin est bon vers tes icônes
import { Icons } from "../icons"; 
import { updateProfile } from "@/actions/update-profile";

import { useSession } from "next-auth/react";

// 1. Structure
interface MetaInfo {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
}

// 2. Props
interface UserMetaCardProps {
  data: MetaInfo;
}

// 3. Récupération { data }
export default function UserMetaCard({ data }: UserMetaCardProps) {
  const { update } = useSession();
  const { isOpen, openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  
  // 4. Init avec data
  const [metaInfo, setMetaInfo] = useState<MetaInfo>(data);
  const [formData, setFormData] = useState<MetaInfo>(data);

  // Synchro si le parent change
  useEffect(() => {
    setMetaInfo(data);
    setFormData(data);
  }, [data]);

  // Synchro à l'ouverture de la modale
  useEffect(() => {
    if (isOpen) setFormData(metaInfo);
  }, [isOpen, metaInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 👇 On sauvegarde en DB
    const result = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        cityState: formData.location, // On mappe location vers cityState
    });

    if (result.success) {
        setMetaInfo(formData); // Mise à jour visuelle
        await update();
        closeModal();
    } else {
        console.error("Erreur:", result.error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image width={80} height={80} src="/images/user/owner.png" alt="user" className="object-cover w-full h-full" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {metaInfo.firstName} {metaInfo.lastName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">{metaInfo.bio}</p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{metaInfo.location}</p>
              </div>
            </div>
             <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <link.icon />
                </a>
              ))}
            </div>
          </div>
          <button onClick={openModal} className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
            <Icons.Edit /> Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          
          {/* ✅ Formulaire connecté */}
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              
              {/* SECTION SOCIAL LINKS (Visuel seulement pour l'instant) */}
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  {SOCIAL_LINKS.map((link) => (
                    <div key={link.label}>
                      <Label>{link.label}</Label>
                      {/* Pour l'instant on laisse defaultValue car on ne sauvegarde pas encore les réseaux en DB */}
                      <Input type="text" defaultValue={link.href} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* SECTION INFO PERSO (Celle qu'on modifie) */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    {/* ✅ CONNECTÉ AU STATE */}
                    <Input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange} 
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    {/* ✅ CONNECTÉ AU STATE */}
                    <Input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                    />
                  </div>

                  {/* J'ai retiré Email et Phone ici car ils sont dans UserInfoCard habituellement */}
                  
                  <div className="col-span-2">
                    <Label>Bio / Position</Label>
                    {/* ✅ CONNECTÉ AU STATE */}
                    <Input 
                        type="text" 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleChange} 
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Location</Label>
                    {/* ✅ CONNECTÉ AU STATE */}
                    <Input 
                        type="text" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                    />
                  </div>

                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>Close</Button>
              <Button size="sm" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/PimjoHQ", icon: Icons.Facebook, label: "Facebook" },
  { href: "https://x.com/PimjoHQ", icon: Icons.X, label: "X.com" },
  { href: "https://www.linkedin.com/company/pimjo", icon: Icons.Linkedin, label: "Linkedin" },
  { href: "https://instagram.com/PimjoHQ", icon: Icons.Instagram, label: "Instagram" },
];