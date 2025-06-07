import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useSanitizedUpload } from "@/hooks/useSanitizedUpload";

const AddLicencaPublicidade = () => {
  const { uploadFile } = useSanitizedUpload();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viaturas, setViaturas] = useState([]);
  const [viaturaId, setViaturaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [licencaNumero, setLicencaNumero] = useState("");
  const [dataEmissao, setDataEmissao] = useState<Date | undefined>(new Date());
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [custoLicenca, setCustoLicenca] = useState("");
  const [matriculaInput, setMatriculaInput] = useState("");
  const [viaturaEncontrada, setViaturaEncontrada] = useState(false);

  useEffect(() => {
    const fetchViaturas = async () => {
      const { data, error } = await supabase
        .from("tblviaturas")
        .select("viaturaid, viaturamarca, viaturamodelo, viaturamatricula");

      if (error) {
        toast({
          title: "Erro ao carregar viaturas",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setViaturas(data);
      }
    };

    fetchViaturas();
  }, [toast]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
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

    const calcularStatusLicenca = (dataVencimento: Date) => {
      const hoje = new Date();
      const diffEmMilissegundos = dataVencimento.getTime() - hoje.getTime();
      const diasParaVencer = diffEmMilissegundos / (1000 * 60 * 60 * 24);
    
      if (dataVencimento < hoje) {
        return "vencido";
      } else if (diasParaVencer <= 30) {
        return "a_vencer";
      } else {
        return "válido";
      }
    };
    const status = calcularStatusLicenca(new Date(dataVencimento));

    try {
      // 1. Upload do arquivo
      const filePath = await uploadFile(arquivo, "licencas-publicidade");

      // 2. Inserção no banco com datas formatadas (ISO) e path do arquivo
      const { error: insertError } = await supabase.from("tbllicencapublicidade").insert([
        {
          viaturaid: viaturaId,
          descricao: descricao,
          licencanumero: licencaNumero,
          dataemissao: format(dataEmissao, "yyyy/MM/dd"),
          datavencimento: format(dataVencimento, "yyyy/MM/dd"),
          licencastatus: status,
          copialicencapublicidade: filePath,
          custolicenca: custoLicenca ? parseFloat(custoLicenca) : null,
        }
      ]);

      if (insertError) throw insertError;

      toast({
        title: "Licença registrada",
        description: "A licença de publicidade foi registrada com sucesso.",
      });
      navigate("/licenca-publicidade");
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/licenca-publicidade")} className="mr-2">
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
            <CardDescription>Preencha os dados da licença de publicidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licencaNumero">Número da Licença*</Label>
                <Input
                  id="licencaNumero"
                  value={licencaNumero}
                  onChange={(e) => setLicencaNumero(e.target.value.toUpperCase())}
                  placeholder="Ex: PUB-2024-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula da Viatura*</Label>
                <div className="relative">
                    <Input
                    id="matricula"
                    value={matriculaInput}
                    onChange={handleMatriculaChange}
                    placeholder="Digite a matrícula (ex: AB-12-CD)"
                    required
                    />
                    {matriculaInput !== "" && (viaturaEncontrada ? ( <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />)
                    :(<AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data de Emissão*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dataEmissao && "text-muted-foreground")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataEmissao ? format(dataEmissao, "dd/MM/yyyy") : "Selecione uma data"}
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
                      className={cn("w-full justify-start text-left font-normal", !dataVencimento && "text-muted-foreground")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataVencimento ? format(dataVencimento, "dd/MM/yyyy") : "Selecione uma data"}
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
                <Label htmlFor="custodalicenca">Custo da Licença</Label>
                <Input
                  id="custodalicenca"
                  type="number"
                  step="0.01"
                  value={custoLicenca}
                  onChange={(e) => setCustoLicenca(e.target.value)}
                  placeholder="Ex: 1500.00"
                />
              </div>

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
                <Label htmlFor="upload">Cópia da Licença*</Label>
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

