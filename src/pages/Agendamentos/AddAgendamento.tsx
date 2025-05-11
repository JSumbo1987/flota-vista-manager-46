import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";

const AddAgendamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [viaturaId, setViaturaId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [dataAgendada, setDataAgendada] = useState<Date | undefined>(new Date());
  const [viaturas, setViaturas] = useState([]);
  const [tiposAssistencia, setTiposAssistencia] = useState([]);
  const [matriculaInput, setMatriculaInput] = useState("");
  const [viaturaEncontrada, setViaturaEncontrada] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: viaturas }, { data: tipos }] = await Promise.all([
        supabase.from("tblviaturas").select("viaturaid, viaturamarca, viaturamatricula"),
        supabase.from("tbltipoassistencia").select("id, nome"),
      ]);

      if (viaturas) setViaturas(viaturas);
      if (tipos) setTiposAssistencia(tipos);
    };

    fetchData();
  }, []);

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

    if (!viaturaId || !tipoId || !dataAgendada || !(dataAgendada instanceof Date)) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("tblagendamentoservico").insert([
        {
          observacao: observacao,
          viaturaid: viaturaId,
          tipoid: tipoId,
          dataagendada: dataAgendada.toISOString(),
          status: 'agendado',
        },
      ]);

      if (error) throw error;

      toast({
        title: "Agendamento criado",
        description: "O serviço foi agendado com sucesso.",
      });

      navigate("/agendamentos");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao agendar o serviço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/agendamentos")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Adicionar Agendamento</h2>
          <p className="text-muted-foreground">Agende um serviço de assistência para uma viatura</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Agendamento</CardTitle>
            <CardDescription>Preencha os dados do serviço a ser agendado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Viatura */}
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula da Viatura*</Label>
                <div className="relative">
                  <Input id="matricula" value={matriculaInput} onChange={handleMatriculaChange}
                  placeholder="Digite a matrícula (ex: AB-12-CD)" required/>
                  {matriculaInput !== "" && (viaturaEncontrada ? ( <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />)
                  :(<AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />))}
                </div>
              </div>

              {/* Tipo de Serviço */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Serviço*</Label>
                <Select value={tipoId} onValueChange={setTipoId}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder={tiposAssistencia.length === 0 ? "Carregando tipos..." : "Selecione o tipo de serviço"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAssistencia.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Agendada */}
              <div className="space-y-2">
                <Label>Data Agendada*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataAgendada && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataAgendada
                        ? format(dataAgendada, "dd/MM/yyyy", { locale: ptBR })
                        : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataAgendada}
                      onSelect={setDataAgendada}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Usuário */}
              <div className="space-y-2">
                <Label htmlFor="observacao">Observação</Label>
                <Input id="observacao" type="text" value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Digite a observação"/>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/agendamentos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Agendamento"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddAgendamento;

