import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, Upload } from "lucide-react";
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

// Mock de viaturas
const viaturasMock = [
  { id: "1", nome: "Toyota Hilux", placa: "ABC-1234" },
  { id: "2", nome: "Ford Ranger", placa: "XYZ-5678" },
];

const AddLicencaTransporte = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [descricao, setDescricao] = useState("");
  const [viaturaId, setViaturaId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [dataEmissao, setDataEmissao] = useState<Date | undefined>(new Date());
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>();
  const [arquivoLicenca, setArquivoLicenca] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao || !viaturaId || !proprietario || !dataEmissao || !dataVencimento || !arquivoLicenca) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: salvar no Supabase
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Licença registrada",
          description: "Licença de transporte registrada com sucesso.",
        });
        navigate("/licencas/transporte");
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/licenca-transporte")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Adicionar Licença de Transporte</h2>
          <p className="text-muted-foreground">Registre uma nova licença de transporte para a viatura</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações da Licença</CardTitle>
            <CardDescription>Preencha os dados da licença de transporte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição*</Label>
                <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Transporte de Carga - Licença 2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="viatura">Viatura*</Label>
                <Select value={viaturaId} onValueChange={setViaturaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma viatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {viaturasMock.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.nome} ({v.placa})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proprietario">Proprietário*</Label>
                <Input id="proprietario" value={proprietario} onChange={(e) => setProprietario(e.target.value)} placeholder="Nome do proprietário" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacao">Observação*</Label>
                <Input id="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex: Transporte de passageiros interprovincial" />
              </div>
              <div className="space-y-2">
                <Label>Data de Emissão*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataEmissao && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataEmissao ? format(dataEmissao, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={dataEmissao} onSelect={setDataEmissao} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataVencimento && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataVencimento ? format(dataVencimento, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataVencimento}
                      onSelect={setDataVencimento}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">Cópia da Licença*</Label>
              <Input
                id="arquivo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setArquivoLicenca(e.target.files?.[0] ?? null)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/licenca-transporte")}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Licença"}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddLicencaTransporte;