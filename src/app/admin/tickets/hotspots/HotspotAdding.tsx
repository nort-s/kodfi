'use client'

import Button from "@/components/ui/button/Button";
import { Plus } from "lucide-react";

interface HotspotAddingProps {
    onCreate: () => void;
}

export default function HotspotAdding({ onCreate }: HotspotAddingProps) {

  return (
    <>
      <div className="flex items-center gap-5">
        <Button
          size="md"
          variant="primary"
          startIcon={<Plus size={18} />}
          onClick={onCreate}
        >
          Ajouter Wifizone
        </Button>
      </div>
    </>
  );
}