import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const combustiveis = ["Gasolina", "Gasóleo", "Elétrico", "Híbrido"];

const AddViatura = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viaturaMatricula, setMatricula] = useState("");
  const [viaturaMarca, setMarca] = useState("");
  const [viaturaModelo, setModelo] = useState("");
  const [viaturaAnoFabrica, setAnoFabrica] = useState("");
  const [viaturaCombustivel, setCombustivel] = useState("");
  const [viaturaCor, setCor] = useState("");
  const [quilometragem, setQuilometragem] = useState("");
  const [viaturaTipoId, setTipoId] = useState("");
  const [viaturaCategoriaId, setCategoriaId] = useState("");
  const [tipos, setTipos] = useState<{ id: number; viaturatipo: string }[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; viaturacategoria: string }[]>([]);

  useEffect(() => {
    const fetchTiposECategorias = async () => {
      const { data: tiposData } = await supabase.from("tblviaturatipo").select("id, viaturatipo");
      const { data: categoriasData } = await supabase.from("tblviaturacategoria").select("id, viaturacategoria");
      if (tiposData) setTipos(tiposData);
      if (categoriasData) setCategorias(categoriasData);
    };

    fetchTiposECategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!viaturaMatricula || !viaturaMarca || !viaturaModelo || !viaturaAnoFabrica || !viaturaCombustivel || !viaturaCor || !quilometragem || !viaturaTipoId || !viaturaCategoriaId) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const matricula = viaturaMatricula.trim().toUpperCase();//Para Verificação no sistema.
    const { count } = await supabase
      .from("tblviaturas").select("*", { count: "exact", head: true }).eq("viaturamatricula", matricula);

    if ((count || 0) > 0) {
      toast({ 
        title: "Ops", 
        description: "A matrícula informado já existe cadastrado no sistema!", 
        variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("tblviaturas").insert({
      viaturamatricula: viaturaMatricula.trim().toUpperCase(),
      viaturamarca: viaturaMarca.trim().toUpperCase(),
      viaturamodelo: viaturaModelo.trim().toUpperCase(),
      viaturaanofabrica: viaturaAnoFabrica,
      viaturacombustivel: viaturaCombustivel.trim().toUpperCase(),
      viaturacor: viaturaCor.trim().toUpperCase(),
      quilometragem: parseFloat(quilometragem),
      viaturatipoid: parseInt(viaturaTipoId),
      viaturacategoriaid: parseInt(viaturaCategoriaId),
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao adicionar registo da viatura",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Viatura registrada com sucesso.",
      });
      navigate("/viaturas");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/viaturas")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Adicionar Viatura</h2>
          <p className="text-muted-foreground">Registre uma nova viatura no sistema</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados da Viatura</CardTitle>
            <CardDescription>Preencha os campos abaixo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Matrícula*</Label>
                <Input value={viaturaMatricula} onChange={(e) => setMatricula(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Marca*</Label>
                <Input value={viaturaMarca} onChange={(e) => setMarca(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Modelo*</Label>
                <Input value={viaturaModelo} onChange={(e) => setModelo(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Ano de Fabricação*</Label>
                <Input value={viaturaAnoFabrica} onChange={(e) => setAnoFabrica(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Cor*</Label>
                <Input value={viaturaCor} onChange={(e) => setCor(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Odômetro (km)*</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={quilometragem}
                  onChange={(e) => setQuilometragem(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo*</Label>
                <Select value={viaturaTipoId} onValueChange={setTipoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.viaturatipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria*</Label>
                <Select value={viaturaCategoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.viaturacategoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Combustível*</Label>
                <Select value={viaturaCombustivel} onValueChange={setCombustivel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de combustível" />
                  </SelectTrigger>
                  <SelectContent>
                    {combustiveis.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/viaturas")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Viatura"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddViatura;






