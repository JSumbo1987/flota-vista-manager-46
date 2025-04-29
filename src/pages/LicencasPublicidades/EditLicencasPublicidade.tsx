// EditLicencaPublicidade.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { supabase } from "@/lib/supabaseClient";

const EditLicencaPublicidade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viaturas, setViaturas] = useState<
    { viaturaid: string; viaturamarca: string; viaturamatricula: string }[]
  >([]);

  const [viaturaId, setViaturaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [licencaNumero, setLicencaNumero] = useState("");
  const [dataEmissao, setDataEmissao] = useState<Date | undefined>();
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>();
  const [status, setStatus] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arquivoExistente, setArquivoExistente] = useState("");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: viaturasData } = await supabase
        .from("tblviaturas")
        .select("viaturaid, viaturamarca, viaturamatricula");

      if (viaturasData) {
        setViaturas(
          viaturasData.map((v) => ({
            ...v,
            viaturaid: String(v.viaturaid),
          }))
        );
      }

      const { data, error } = await supabase
        .from("tbllicencapublicidade")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setViaturaId(String(data.viaturaid));
        setDescricao(data.descricao || "");
        setLicencaNumero(data.licencanumero || "");
        setDataEmissao(new Date(data.dataemissao));
        setDataVencimento(new Date(data.datavencimento));
        setStatus(data.licencastatus);
        setArquivoExistente(data.copialicencapublicidade || "");
        if (data.copialicencapublicidade) {
          fetchSignedUrl(data.copialicencapublicidade);
        }
      }
    };
    fetchData();
  }, [id]);

  const fetchSignedUrl = async (path: string) => {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from("documentos")
      .createSignedUrl(path, 60);
    if (!error) setSignedUrl(data?.signedUrl ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !viaturaId ||
      !descricao ||
      !licencaNumero ||
      !dataEmissao ||
      !dataVencimento
    ) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const inicioFormatado = format(dataEmissao, "yyyy/MM/dd");
    const fimFormatado = format(dataVencimento, "yyyy/MM/dd");

    try {
      const calcularStatusLicenca = (dataVencimento: Date) => {
        const hoje = new Date();
        const diffEmMilissegundos = dataVencimento.getTime() - hoje.getTime();
        const diasParaVencer = diffEmMilissegundos / (1000 * 60 * 60 * 24);
        
        if (dataVencimento < hoje) {
            return "expirado";
        } else if (diasParaVencer <= 30) {
            return "a_vencer";
        } else {
            return "válido";
        }
      };
      const novoStatus = calcularStatusLicenca(new Date(fimFormatado));

      let filePath = arquivoExistente;

      if (arquivo) {
        const ext = arquivo.name.split(".").pop();
        filePath = `licencas-publicidade/${licencaNumero}-${Date.now()}.${ext}`;
        await supabase.storage.from("licencas-publicidade").upload(filePath, arquivo, {
          upsert: true,
        });
      }

      const { error } = await supabase
        .from("tbllicencapublicidade")
        .update({
          viaturaid: viaturaId,
          descricao: descricao,
          licencanumero: licencaNumero,
          dataemissao: inicioFormatado,
          datavencimento: fimFormatado,
          copialicencapublicidade: filePath,
          licencastatus: novoStatus,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Licença atualizada",
        description: "A licença foi editada com sucesso.",
      });

      navigate("/licenca-publicidade");
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: (error as Error).message || "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
          <h2 className="text-3xl font-bold tracking-tight">
            Editar Licença
          </h2>
          <p className="text-muted-foreground">
            Atualize os dados da licença de publicidade
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações da Licença</CardTitle>
            <CardDescription>
              Altere os campos necessários e salve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licencaNumero">Número da Licença*</Label>
                <Input
                  id="licencaNumero"
                  value={licencaNumero}
                  onChange={(e) => setLicencaNumero(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="viatura">Viatura*</Label>
                <Select value={viaturaId} onValueChange={setViaturaId}>
                  <SelectTrigger id="viatura">
                    <SelectValue placeholder="Selecione uma viatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {viaturas.map((v) => (
                      <SelectItem key={v.viaturaid} value={v.viaturaid}>
                        {v.viaturamarca} ({v.viaturamatricula})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição*</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
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
                      {dataEmissao
                        ? format(dataEmissao, "dd/MM/yyyy")
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataEmissao}
                      onSelect={setDataEmissao}
                      initialFocus
                      locale={ptBR}
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
                      {dataVencimento
                        ? format(dataVencimento, "dd/MM/yyyy")
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataVencimento}
                      onSelect={setDataVencimento}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="arquivo">
                  Arquivo (PDF ou imagem){arquivoExistente && " (já existente) "}
                </Label>
                {arquivoExistente && (
                  <a
                    href={`${signedUrl ? signedUrl.toString() : ""}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Visualizar o documento
                  </a>
                )}
                <Input
                  type="file"
                  id="arquivo"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/licenca-publicidade")}
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

export default EditLicencaPublicidade;

