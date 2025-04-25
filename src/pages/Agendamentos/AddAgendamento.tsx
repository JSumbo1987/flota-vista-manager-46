import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar } from "lucide-react";
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

const AddAgendamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userId, setUserId] = useState("");
  const [viaturaId, setViaturaId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [dataAgendada, setDataAgendada] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState("Pendente");

  const [usuarios, setUsuarios] = useState([]);
  const [viaturas, setViaturas] = useState([]);
  const [tiposAssistencia, setTiposAssistencia] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: usuarios }, { data: viaturas }, { data: tipos }] = await Promise.all([
        supabase.from("tblusuarios").select("userid, usernome"),
        supabase.from("tblviaturas").select("viaturaid, viaturamarca, viaturamatricula"),
        supabase.from("tbltipoassistencia").select("id, nome"),
      ]);

      if (usuarios) setUsuarios(usuarios);
      if (viaturas) setViaturas(viaturas);
      if (tipos) setTiposAssistencia(tipos);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !viaturaId || !tipoId || !dataAgendada || !(dataAgendada instanceof Date)) {
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
          userid: userId,
          viaturaid: viaturaId,
          tipoid: tipoId,
          dataagendada: dataAgendada.toISOString(),
          status: status,
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
              {/* Usuário */}
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário Responsável*</Label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger id="usuario">
                    <SelectValue placeholder={usuarios.length === 0 ? "Carregando usuários..." : "Selecione o usuário"} />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.userid} value={String(u.userid)}>
                        {u.usernome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Viatura */}
              <div className="space-y-2">
                <Label htmlFor="viatura">Viatura*</Label>
                <Select value={viaturaId} onValueChange={setViaturaId}>
                  <SelectTrigger id="viatura">
                    <SelectValue placeholder={viaturas.length === 0 ? "Carregando viaturas..." : "Selecione uma viatura"} />
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

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
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

