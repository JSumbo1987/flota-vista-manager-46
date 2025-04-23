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

// Mock de viaturas (substituir pelo fetch real)
const viaturasMock = [
  { id: "1", nome: "Toyota Hilux", placa: "ABC-1234" },
  { id: "2", nome: "Ford Ranger", placa: "XYZ-5678" },
];

const AddLicencaPublicidade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado do formulário
  const [viaturaId, setViaturaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [licencaNumero, setLicencaNumero] = useState("");
  const [dataEmissao, setDataEmissao] = useState<Date | undefined>(new Date());
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>();
  const [licencaStatus, setLicencaStatus] = useState(true);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!viaturaId || !descricao || !licencaNumero || !dataEmissao || !dataVencimento || !arquivo) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Substituir por chamada real à API/Supabase
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Licença registrada",
          description: "A licença de publicidade foi registrada com sucesso.",
        });
        navigate("/licencas/publicidade");
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao registrar a licença. Tente novamente.",
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
          onClick={() => navigate("/licenca-publicidade")}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Adicionar Licença de Publicidade</h2>
          <p className="text-muted-foreground">
            Registre uma nova licença de publicidade vinculada a uma viatura
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações da Licença</CardTitle>
            <CardDescription>
              Preencha os dados da licença de publicidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição*</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Licença para publicidade traseira"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licencaNumero">Número da Licença*</Label>
                <Input
                  id="licencaNumero"
                  value={licencaNumero}
                  onChange={(e) => setLicencaNumero(e.target.value)}
                  placeholder="Ex: PUB-2024-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Viatura*</Label>
                <Select
                  value={viaturaId}
                  onValueChange={setViaturaId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma viatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {viaturasMock.map((viatura) => (
                      <SelectItem key={viatura.id} value={viatura.id}>
                        {viatura.nome} ({viatura.placa})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Emissão*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataEmissao && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataEmissao ? format(dataEmissao, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0 w-auto">
                    <CalendarComponent
                      mode="single"
                      selected={dataEmissao}
                      onSelect={setDataEmissao}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataVencimento && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataVencimento ? format(dataVencimento, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0 w-auto">
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={licencaStatus ? "ativa" : "inativa"}
                  onValueChange={(value) => setLicencaStatus(value === "ativa")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status da licença" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload">Cópia da Licença (PDF ou imagem)*</Label>
                <Input
                  id="upload"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/licenca-publicidade")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Licença"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddLicencaPublicidade;