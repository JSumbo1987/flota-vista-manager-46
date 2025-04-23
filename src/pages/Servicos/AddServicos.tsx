import { useState } from "react";
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

// Mock data
const viaturas = [
  { id: 1, nome: "Toyota Hilux" },
  { id: 2, nome: "Ford Ranger" },
];

const categorias = [
  { id: 1, nome: "Mecânica" },
  { id: 2, nome: "Elétrica" },
];

const tipos = [
  { id: 1, nome: "Troca de óleo" },
  { id: 2, nome: "Revisão geral" },
];

const prestadores = [
  { id: 1, nome: "Oficina A" },
  { id: 2, nome: "Oficina B" },
];

const AddServico = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viaturaId, setViaturaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [prestadorId, setPrestadorId] = useState("");
  const [dataServico, setDataServico] = useState<Date | undefined>(new Date());
  const [custo, setCusto] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!viaturaId || !categoriaId || !tipoId || !prestadorId || !dataServico || !custo) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integrar com Supabase
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Serviço registrado",
          description: "O serviço foi registrado com sucesso.",
        });
        navigate("/servicos");
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro",
        description: "Erro ao registrar o serviço.",
        variant: "destructive",
      });
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
                <Label>Viatura*</Label>
                <Select value={viaturaId} onValueChange={setViaturaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma viatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {viaturas.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.nome}
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
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nome}
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
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataServico && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataServico ? format(dataServico, "PPP", { locale: ptBR }) : "Selecionar data"}
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
            <Button type="button" variant="outline" onClick={() => navigate("/servicos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Serviço"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddServico;