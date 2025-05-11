import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const TipoModal = ({ open, onClose, onSave }: { open: boolean, onClose: () => void, onSave: () => void }) => {
  const [novoTipo, setNovoTipo] = useState("");

  const handleSave = async () => {
    if (!novoTipo.trim()) return;
    await supabase.from("tblviaturatipo").insert({ viaturatipo: novoTipo.trim() });
    onSave();
    setNovoTipo("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Tipo de Viatura</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} placeholder="Tipo de viatura" />
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TipoModal;
