import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, CheckCircle, AlertCircle } from "lucide-react";
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
import TipoModal from "@/components/TipoCategoriaServico/TipoModal";
import CategoriaModal from "@/components/TipoCategoriaServico/CategoriaModal";

const AddServico = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viaturaId, setViaturaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [prestadorId, setPrestadorId] = useState("");
  const [dataServico, setDataServico] = useState<Date | undefined>(new Date());
  const [precoServico, setPrecoServico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [viaturas, setViaturas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [matriculaInput, setMatriculaInput] = useState("");
  const [viaturaEncontrada, setViaturaEncontrada] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: viaturasData } = await supabase.from("tblviaturas").select("viaturaid, viaturamatricula, viaturamarca");
      const { data: prestadoresData } = await supabase.from("tblprestador").select("prestadorid, prestadornome");

      if (viaturasData) setViaturas(viaturasData);
      if (prestadoresData) setPrestadores(prestadoresData);
    };

    fetchData();
    fetchTiposECategorias();
  }, []);

  const fetchTiposECategorias = async () => {
      const { data: categoriasData } = await supabase.from("tblcategoriaassistencia").select("id, nome");
      if (categoriasData) setCategorias(categoriasData);
  };

  const fetchTiposPorCategoria = async (categoriaId: string) => {
    const { data: tiposData } = await supabase
      .from("tbltipoassistencia")
      .select("id, nome")
      .eq("categoriaid", categoriaId);
  
    if (tiposData) {
      setTipos(tiposData);
    } else {
      setTipos([]);
    }
  };  

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase();
    setMatriculaInput(input);
  
    const encontrada = viaturas.find(v => v.viaturamatricula.toUpperCase() === input);
    if (encontrada) {
      setViaturaEncontrada(true);
      setViaturaId(encontrada.viaturaid);
    } else {
      setViaturaEncontrada(false);
      setViaturaId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!viaturaId || !categoriaId || !tipoId || !dataServico || !precoServico || !prestadorId) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("tblservicos").insert([
      {
        viaturaid: viaturaId,
        categoriaid: categoriaId,
        tipoid: tipoId,
        prestadorid: prestadorId || null,
        dataservico: dataServico?.toISOString(),
        custo: parseFloat(precoServico),
        observacoes: observacoes,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar o serviço.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Serviço registrado",
        description: "O serviço foi registrado com sucesso.",
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
          <h2 className="text-3xl font-bold">Adicionar Serviço</h2>
          <p className="text-muted-foreground">Registre um novo serviço de assistência à viatura</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados do Serviço</CardTitle>
            <CardDescription>Preencha os campos abaixo para registrar o serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula da Viatura*</Label>
              <div className="relative">
                  <Input id="matricula" value={matriculaInput} onChange={handleMatriculaChange}
                   placeholder="Digite a matrícula (ex: AB-12-CD)" required/>
                  {matriculaInput !== "" && (viaturaEncontrada ? ( <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />)
                  :(<AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria de Serviço*</Label>
              <div className="flex items-center gap-2">
                <Select value={categoriaId} onValueChange={(value)=>{
                    setCategoriaId(value); 
                    setTipoId(""); // Limpa tipo anterior
                    fetchTiposPorCategoria(value);} }>
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
                <Button type="button" onClick={() => setShowCategoriaModal(true)}>+</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Serviço*</Label>
              <div className="flex items-center gap-2">
                <Select value={tipoId} onValueChange={setTipoId} disabled={!categoriaId}>
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
                <Button type="button" onClick={() => setShowTipoModal(true)} disabled={!categoriaId}>+</Button>
              </div>
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
              <Label htmlFor="custo">Custo do Serviço*</Label>
              <Input id="precoServico" type="text" value={precoServico} onChange={(e) => setPrecoServico(e.target.value)} placeholder="Preço unitário" maxLength={10}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Input id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais sobre o serviço"/>
          </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/servicos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Serviço"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      {/*Tipo e Categoria de Viaturas*/}
      <TipoModal
        open={showTipoModal}
        onClose={() => setShowTipoModal(false)}
        onSave={fetchTiposECategorias}
      />
      <CategoriaModal
        open={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        onSave={fetchTiposECategorias}
      />
    </div>
  );
};

export default AddServico;
