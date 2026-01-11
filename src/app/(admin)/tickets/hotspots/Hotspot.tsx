'use client';

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import HotspotAdding from "./HotspotAdding";
import HotspotsTable from "./HotspotsTable";
import HotspotForm from "./HotspotForm";

import { Hotspot as Hotspot } from "@/lib/prisma";

import { useState } from "react";

import { Modal } from "@/components/ui/modal";
import axios from "axios";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";


interface HotspotProps {
  hotspots: Hotspot[];
}

export default function HotspotComp({ hotspots }: HotspotProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);


  const handleCreate = () => {
    setSelectedHotspot(null);
    setIsModalOpen(true);
  };
  const handleEdit = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedHotspot(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce hotspot ?")) return;

    try {
      await axios.delete(`/api/hotspots/${id}`);

      toast.success("Hotspot supprimé");

      // 3. Rafraîchir la page pour que la liste se mette à jour
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error("Impossible de supprimer");
    }
  };


  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Liste de vos points d'accès" actions={<HotspotAdding onCreate={handleCreate} />}>

          <HotspotsTable
            data={hotspots}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <Modal
            title="Nouveau Point d'accès"
            isOpen={isModalOpen}
            onClose={handleClose}
            className="max-w-[700px] p-6 lg:p-10"
          >
            <HotspotForm
              onSuccess={() => setIsModalOpen(false)}
              initialData={selectedHotspot}
            />
          </Modal>
        </ComponentCard>
      </div>
    </div>
  );
}
