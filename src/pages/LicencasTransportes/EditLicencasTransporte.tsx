
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Calendar, CheckCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useSanitizedUpload } from "@/hooks/useSanitizedUpload";

interface Viatura {
  viaturaid: string;
  viaturamarca: string;
  viaturamodelo: string;
  viaturamatricula: string;
}

const EditLicencaTransporte = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [viaturaId, setViaturaId] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [proprietario, setProprietario] = useState<string>("");
  const [dataEmissao, setDataEmissao] = useState<Date | undefined>();
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [copiaAtual, setCopiaAtual] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [licencaNumero, setLicencaNumero] = useState<string>("");
  const [custoLicenca, setCustoLicenca] = useState<string>("");
  const [matriculaInput, setMatriculaInput] = useState("");
  const [viaturaEncontrada, setViaturaEncontrada] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const { replaceFile } = useSanitizedUpload();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: viaturasData, error: viaturasError } = await supabase
          .from("tblviaturas")
          .select("viaturaid, viaturamarca, viaturamodelo, viaturamatricula");

        if (viaturasError) {
          throw viaturasError;
        }

        if (viaturasData) {
          setViaturas(viaturasData);
        }

        const { data, error } = await supabase
          .from("tbllicencatransportacao")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          throw error || new Error("Licença não encontrada");
        }

        setViaturaId(data.viaturaid);
        setDescricao(data.descricao);
        setObservacao(data.observacao || "");
        setProprietario(data.proprietario);
        setDataEmissao(new Date(data.dataemissao));
        setDataVencimento(new Date(data.datavencimento));
        setCopiaAtual(data.copialicencatransporte);
        setLicencaNumero(data.licencanumero || "");
        setCustoLicenca(data.custolicenca ? data.custolicenca.toString() : "");
        if (data.copialicencatransporte) {
          fetchSignedUrl(data.copialicencatransporte);
        }

      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Erro desconhecido.",
          variant: "destructive",
        });
        navigate("/licenca-transporte");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, toast]);

  useEffect(() => {
    if (viaturaId && viaturas.length > 0) {
      const viaturaSelecionada = viaturas.find(v => v.viaturaid === viaturaId);
      if (viaturaSelecionada) {
        setMatriculaInput(viaturaSelecionada.viaturamatricula);
        setViaturaEncontrada(true);
      }
    }
  }, [viaturaId, viaturas]);
  
  const fetchSignedUrl = async (path: string) => {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from("documentos")
      .createSignedUrl(path, 60);
    if (!error) setSignedUrl(data?.signedUrl ?? null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setArquivo(e.target.files[0]);
    }
  };

  const calcularStatusLicenca = (vencimento: Date) => {
    const hoje = new Date();
    const diasParaVencer = (vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

    if (vencimento < hoje) return "vencido";
    if (diasParaVencer <= 30) return "a_vencer";
    return "válido";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!viaturaId || !descricao || !proprietario || !dataEmissao || !dataVencimento || !licencaNumero) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let filePath = copiaAtual;
      if (arquivo) {
        filePath = await replaceFile(arquivo, copiaAtual, "licencas-transportacao");  
      }      

      const status = calcularStatusLicenca(dataVencimento);

      const { error: updateError } = await supabase
        .from("tbllicencatransportacao")
        .update({
          viaturaid: viaturaId,
          descricao,
          observacao,
          proprietario,
          dataemissao: format(dataEmissao, "yyyy-MM-dd"),
          datavencimento: format(dataVencimento, "yyyy-MM-dd"),
          copialicencatransporte: filePath,
          licencastatus: status,
          licencanumero: licencaNumero,
          custolicenca: custoLicenca ? parseFloat(custoLicenca) : null,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Licença atualizada com sucesso!",
      });

      navigate("/licenca-transporte");
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/licenca-transporte")}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editar Licença de Transportação</h2>
          <p className="text-muted-foreground">
            Atualize os dados da licença de transportação
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações da Licença</CardTitle>
            <CardDescription>Preencha os campos abaixo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Viatura */}
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula da Viatura*</Label>
                <div className="relative">
                    <Input
                    id="matricula"
                    value={matriculaInput}
                    onChange={handleMatriculaChange}
                    placeholder="Digite a matrícula (ex: AB-12-CD)"
                    required
                    readOnly
                    />
                    {viaturaEncontrada && (
                    <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                </div>
              </div>

              {/* Número da Licença */}
              <div className="space-y-2">
                <Label htmlFor="licencanumero">Número da Licença*</Label>
                <Input
                  id="licencanumero"
                  value={licencaNumero}
                  onChange={(e) => setLicencaNumero(e.target.value.toUpperCase())}
                  placeholder="Ex: LT-2023-12345"
                  required
                />
              </div>

              {/* Data Emissão */}
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
                  <PopoverContent align="start" className="p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dataEmissao}
                      onSelect={setDataEmissao}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data Vencimento */}
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
                  <PopoverContent align="start" className="p-0">
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

              {/* Descrição */}
              <div className="space-y-2">
                <Label>Descrição*</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>

              {/* Proprietário */}
              <div className="space-y-2">
                <Label>Proprietário*</Label>
                <Input
                  id="proprietario"
                  value={proprietario}
                  onChange={(e) => setProprietario(e.target.value.toUpperCase())}
                  required
                />
              </div>

              {/* Custo da Licença */}
              <div className="space-y-2">
                <Label htmlFor="custolicenca">Custo da Licença*</Label>
                <Input
                  id="custolicenca"
                  type="number"
                  step="0.01"
                  value={custoLicenca}
                  onChange={(e) => setCustoLicenca(e.target.value)}
                  placeholder="Ex: 1500.00"
                />
              </div>

              {/* Observação */}
              <div className="space-y-2">
                <Label>Observação</Label>
                <Input
                  id="observacao"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>

              {/* Arquivo */}
              <div className="space-y-2">
                <Label>Cópia da Licença</Label>
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                />
                {copiaAtual && (
                  <div className="mb-4">
                    <a
                      href={`${signedUrl ? signedUrl.toString() : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Visualizar Cópia da Licença actual
                    </a>
                  </div>
                )}
              </div>

            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/licenca-transporte")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditLicencaTransporte;
