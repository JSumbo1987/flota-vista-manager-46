import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditServico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viaturaId, setViaturaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [prestadorId, setPrestadorId] = useState("");
  const [dataServico, setDataServico] = useState<Date | undefined>(undefined);
  const [custo, setCusto] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [viaturas, setViaturas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: viaturasData } = await supabase.from("tblviaturas").select("viaturaid, viaturamatricula, viaturamarca");
      const { data: categoriasData } = await supabase.from("tblcategoriaassistencia").select("id, nome");
      const { data: tiposData } = await supabase.from("tbltipoassistencia").select("id, nome");
      const { data: prestadoresData } = await supabase.from("tblprestador").select("prestadorid, prestadornome");

      if (viaturasData) setViaturas(viaturasData);
      if (categoriasData) setCategorias(categoriasData);
      if (tiposData) setTipos(tiposData);
      if (prestadoresData) setPrestadores(prestadoresData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchServico = async () => {
      const { data, error } = await supabase.from("tblservicos").select("*").eq("id", id).single();
      if (data) {
        setViaturaId(String(data.viaturaid));
        setCategoriaId(String(data.categoriaid));
        setTipoId(String(data.tipoid));
        setPrestadorId(String(data.prestadorid));
        setDataServico(data.dataservico ? new Date(data.dataservico) : undefined);
        setCusto(String(data.custo));
        setObservacoes(data.observacoes);
      } else {
        toast({
          title: "Erro ao carregar serviço",
          description: error?.message || "Erro ao buscar os dados do serviço.",
          variant: "destructive",
        });
      }
    };
    if (id) fetchServico();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!viaturaId || !categoriaId || !tipoId || !dataServico || !custo || !prestadorId) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("tblservicos").update({
      viaturaid: viaturaId,
      categoriaid: categoriaId,
      tipoid: tipoId,
      prestadorid: prestadorId || null,
      dataservico: dataServico?.toISOString(),
      custo: parseFloat(custo),
      observacoes: observacoes,
    }).eq("id", id);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar o serviço.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
      navigate("/servicos");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/servicos")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Editar Serviço</h2>
          <p className="text-muted-foreground">Altere os dados do serviço registrado</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados do Serviço</CardTitle>
            <CardDescription>Edite os campos abaixo para atualizar o serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Viatura*</Label>
                <Select value={viaturaId} onValueChange={setViaturaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma viatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {viaturas.map((v) => (
                      <SelectItem key={v.viaturaid} value={String(v.viaturaid)}>
                        {v.viaturamarca} ({v.viaturamatricula})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria*</Label>
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

              <div className="space-y-2">
                <Label>Tipo de Serviço*</Label>
                <Select value={tipoId} onValueChange={setTipoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prestador de Serviço*</Label>
                <Select value={prestadorId} onValueChange={setPrestadorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prestador" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestadores.map((p) => (
                      <SelectItem key={p.prestadorid} value={String(p.prestadorid)}>
                        {p.prestadornome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data do Serviço*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dataServico && "text-muted-foreground")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataServico ? format(dataServico, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataServico}
                      onSelect={setDataServico}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custo">Custo (Kz)*</Label>
                <Input
                  id="custo"
                  type="number"
                  step="0.01"
                  value={custo}
                  onChange={(e) => setCusto(e.target.value)}
                  placeholder="Ex: 15000.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações adicionais sobre o serviço"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/servicos")}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Alterações"}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditServico;
