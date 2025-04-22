
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

// Mock data para viaturas
const viaturasMock = [
  { id: "1", nome: "Toyota Hilux", placa: "ABC-1234" },
  { id: "2", nome: "Ford Ranger", placa: "XYZ-5678" },
  { id: "3", nome: "Mitsubishi L200", placa: "DEF-9012" },
  { id: "4", nome: "Volkswagen Amarok", placa: "GHI-3456" },
  { id: "5", nome: "Chevrolet S10", placa: "JKL-7890" },
];

const AddCertificado = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulário
  const [numero, setNumero] = useState("");
  const [viaturaId, setViaturaId] = useState("");
  const [entidadeEmissora, setEntidadeEmissora] = useState("INATTER");
  const [dataEmissao, setDataEmissao] = useState<Date | undefined>(new Date());
  const [dataValidade, setDataValidade] = useState<Date | undefined>(undefined);
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numero || !viaturaId || !dataEmissao || !dataValidade) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implementar integração real com Supabase
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Certificado registrado",
          description: "O certificado de inspeção foi registrado com sucesso.",
        });
        navigate("/certificados");
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao registrar o certificado. Tente novamente.",
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
          onClick={() => navigate("/certificados")}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Adicionar Certificado</h2>
          <p className="text-muted-foreground">
            Registre um novo certificado de inspeção para uma viatura
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Certificado</CardTitle>
            <CardDescription>
              Preencha os dados do certificado de inspeção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número do Certificado*</Label>
                <Input
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex: CERT-001-2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="viatura">Viatura*</Label>
                <Select
                  value={viaturaId}
                  onValueChange={setViaturaId}
                  required
                >
                  <SelectTrigger id="viatura">
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
                <Label htmlFor="entidade">Entidade Emissora*</Label>
                <Input
                  id="entidade"
                  value={entidadeEmissora}
                  onChange={(e) => setEntidadeEmissora(e.target.value)}
                  placeholder="Ex: INATTER"
                  required
                />
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
                      {dataEmissao ? (
                        format(dataEmissao, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataEmissao}
                      onSelect={setDataEmissao}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data de Validade*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataValidade && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataValidade ? (
                        format(dataValidade, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataValidade}
                      onSelect={setDataValidade}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações adicionais sobre o certificado"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/certificados")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Certificado"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddCertificado;
