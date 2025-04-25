import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const combustiveis = ["Gasolina", "Gasóleo", "Elétrico", "Híbrido"];

const EditViatura = () => {
  const { viaturaId } = useParams();
  console.log(viaturaId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
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
      const [{ data: tiposData }, { data: categoriasData }] = await Promise.all([
        supabase.from("tblviaturatipo").select("id, viaturatipo"),
        supabase.from("tblviaturacategoria").select("id, viaturacategoria"),
      ]);
      if (tiposData) setTipos(tiposData);
      if (categoriasData) setCategorias(categoriasData);
    };

    fetchTiposECategorias();
  }, []);

  useEffect(() => {
    const fetchViatura = async () => {
      if (!viaturaId) return;
      const { data, error } = await supabase
        .from("tblviaturas")
        .select("*")
        .eq("viaturaid", viaturaId)
        .single();

      if (error) {
        toast({
          title: "Erro ao carregar registo da viatura",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setMatricula(data.viaturamatricula || "");
        setMarca(data.viaturamarca || "");
        setModelo(data.viaturamodelo || "");
        setAnoFabrica(data.viaturaanofabrica || "");
        setCombustivel(data.viaturacombustivel || "");
        setCor(data.viaturacor || "");
        setQuilometragem(String(data.quilometragem || ""));
        setTipoId(String(data.viaturatipoid));
        setCategoriaId(String(data.viaturacategoriaid));
      }

      setIsLoading(false);
    };

    fetchViatura();
  }, [viaturaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !viaturaMatricula ||
      !viaturaMarca ||
      !viaturaModelo ||
      !viaturaAnoFabrica ||
      !viaturaCombustivel ||
      !viaturaCor ||
      !quilometragem ||
      !viaturaTipoId ||
      !viaturaCategoriaId
    ) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (viaturaAnoFabrica.length !== 4 || isNaN(Number(viaturaAnoFabrica))) {
      toast({
        title: "Ano de Fabricação inválido",
        description: "Informe um ano com 4 dígitos.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(quilometragem) < 0) {
      toast({
        title: "Quilometragem inválida",
        description: "A quilometragem não pode ser negativa.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("tblviaturas")
      .update({
        viaturamatricula: viaturaMatricula,
        viaturamarca: viaturaMarca,
        viaturamodelo: viaturaModelo,
        viaturaanofabrica: viaturaAnoFabrica,
        viaturacombustivel: viaturaCombustivel,
        viaturacor: viaturaCor,
        quilometragem: parseFloat(quilometragem),
        viaturatipoid: parseInt(viaturaTipoId),
        viaturacategoriaid: parseInt(viaturaCategoriaId),
      })
      .eq("viaturaid", viaturaId);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao atualizar registo da viatura",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Viatura atualizada com sucesso.",
      });
      navigate("/viaturas");
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando os dados da viatura...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/viaturas")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Editar Viatura</h2>
          <p className="text-muted-foreground">Atualize os dados da viatura</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados da Viatura</CardTitle>
            <CardDescription>Edite os campos abaixo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Matrícula*" value={viaturaMatricula} onChange={setMatricula} placeholder="Ex: ABC-123" />
              <InputGroup label="Marca*" value={viaturaMarca} onChange={setMarca} placeholder="Ex: Toyota" />
              <InputGroup label="Modelo*" value={viaturaModelo} onChange={setModelo} placeholder="Ex: Corolla" />
              <InputGroup label="Ano de Fabricação*" value={viaturaAnoFabrica} onChange={setAnoFabrica} placeholder="Ex: 2019" />
              <InputGroup label="Cor*" value={viaturaCor} onChange={setCor} placeholder="Ex: Prata" />
              <InputGroup
                label="Odômetro (km)*"
                value={quilometragem}
                onChange={setQuilometragem}
                placeholder="Ex: 123456.78"
                type="number"
                step="0.01"
              />

              <SelectGroup
                label="Tipo*"
                value={viaturaTipoId}
                onChange={setTipoId}
                options={tipos}
                loading={!tipos.length}
                optionLabel="viaturatipo"
              />

              <SelectGroup
                label="Categoria*"
                value={viaturaCategoriaId}
                onChange={setCategoriaId}
                options={categorias}
                loading={!categorias.length}
                optionLabel="viaturacategoria"
              />

              <SelectGroup
                label="Combustível*"
                value={viaturaCombustivel}
                onChange={setCombustivel}
                options={combustiveis.map((c) => ({ id: c, label: c }))}
                optionLabel="label"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/viaturas")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, ...props }: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} {...props} />
  </div>
);

const SelectGroup = ({ label, value, onChange, options, loading, optionLabel = "label" }: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Carregando..." : `Selecione ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt: any) => (
          <SelectItem key={opt.id} value={String(opt.id)}>
            {opt[optionLabel]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default EditViatura;

