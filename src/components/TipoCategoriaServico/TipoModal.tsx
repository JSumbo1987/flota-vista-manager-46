import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Description } from "@radix-ui/react-toast";

const TipoModal = ({ open, onClose, onSave }: { open: boolean, onClose: () => void, onSave: () => void }) => {
  const [novoTipo, setNovoTipo] = useState("");
  const [descricaoTipo, setDescricaoTipo] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaId, setCategoriaId] = useState("");

  useEffect(()=>{
    const fetchCategorias = async () => {
        const { data, error } = await supabase.from("tblcategoriaassistencia").select("id, nome");

        if (error) return error;
        setCategorias(data);
      };
      console.log(categorias);
      fetchCategorias();
  },[]);

  const handleSave = async () => {
    if (!novoTipo.trim()) return;
    await supabase.from("tbltipoassistencia")
        .insert({ 
            nome: novoTipo.trim(),
            descricao: descricaoTipo.trim(),
            categoriaid: categoriaId,
        });
    onSave();
    setNovoTipo("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Tipo de Serviço</DialogTitle>
          <Description></Description>
        </DialogHeader>
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Categoria de Serviço*</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {categorias.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                            {c.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          <Input value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} placeholder="Tipo de Serviço" />
          <Input value={descricaoTipo} onChange={(e) => setDescricaoTipo(e.target.value)} placeholder="Descrição do tipo" />
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TipoModal;