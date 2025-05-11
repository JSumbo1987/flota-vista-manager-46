import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CategoriaModal = ({ open, onClose, onSave }: { open: boolean, onClose: () => void, onSave: () => void }) => {
  const [novaCategoria, setNovaCategoria] = useState("");
  const [descricaoCategoria, setDescricaoCategoria] = useState("");

  const handleSave = async () => {
    if (!novaCategoria.trim()) return;
    await supabase.from("tblcategoriaassistencia")
        .insert({
            nome: novaCategoria.trim(),
            descricao: descricaoCategoria.trim()
        });
    onSave();
    setNovaCategoria("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Categoria de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} placeholder="Categoria de Serviço" />
          <Input value={descricaoCategoria} onChange={(e) => setDescricaoCategoria(e.target.value)} placeholder="Descrição..." />
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoriaModal;