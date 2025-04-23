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
const viaturasMock = [
  { id: "1", nome: "Toyota Hilux", placa: "ABC-1234" },
  { id: "2", nome: "Ford Ranger", placa: "XYZ-5678" },
];

const usuariosMock = [
  { id: "1", nome: "João Pedro" },
  { id: "2", nome: "Maria Silva" },
];

const tiposAssistenciaMock = [
  { id: "1", nome: "Revisão de motor" },
  { id: "2", nome: "Troca de pneus" },
];

const AddAgendamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userId, setUserId] = useState("");
  const [viaturaId, setViaturaId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [dataAgendada, setDataAgendada] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState("Pendente");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !viaturaId || !tipoId || !dataAgendada) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integração real com Supabase
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Agendamento criado",
          description: "O serviço foi agendado com sucesso.",
        });
        navigate("/agendamentos");
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro",
        description: "Erro ao agendar o serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/agendamentos")}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Adicionar Agendamento</h2>
          <p className="text-muted-foreground">
            Agende um serviço de assistência para uma viatura
          </p>
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
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário Responsável*</Label>
                <Select value={userId} onValueChange={setUserId} required>
                  <SelectTrigger id="usuario">
                    <SelectValue placeholder="Selecione o usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuariosMock.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="viatura">Viatura*</Label>
                <Select value={viaturaId} onValueChange={setViaturaId} required>
                  <SelectTrigger id="viatura">
                    <SelectValue placeholder="Selecione uma viatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {viaturasMock.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.nome} ({v.placa})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Serviço*</Label>
                <Select value={tipoId} onValueChange={setTipoId} required>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAssistenciaMock.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Agendada*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataAgendada && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataAgendada ? (
                        format(dataAgendada, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
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