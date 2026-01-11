'use client'

import Button from "@/components/ui/button/Button";
import { Plus, Download } from "lucide-react"; // Icone Plus

interface CodesAddingProps {
}
export default function CodesAdding({ }: CodesAddingProps) {
    return (
        <div className="flex items-center gap-5">
            <Button size="sm" variant="outline" startIcon={<Download />}>
                Importer
            </Button>
            <Button size="md" variant="primary" startIcon={<Plus size={18}/>}>
                Ajouter Hotspot
            </Button>
        </div>
    )
}
