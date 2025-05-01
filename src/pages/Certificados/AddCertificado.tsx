
import { useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabaseClient";

const AddCertificado = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viaturas, setViaturas] = useState<
    { viaturaid: string; viaturamarca: string; viaturamatricula: string }[]
  >([]);

  const [viaturaId, setViaturaId] = useState("");
  const [centroInspeccao, setCentroInspeccao] = useState("");
  const [numeroDoQuadro, setNumeroDoQuadro] = useState("");
  const [quilometragem, setQuilometragem] = useState("");
  const [dataHoraInspeccao, setDataHoraInspeccao] = useState<Date | undefined>(
    new Date()
  );
  const [proximaInspeccao, setProximaInspeccao] = useState<Date | undefined>();
  const [numeroCertificado, setNumeroCertificado] = useState("");
  const [custoCertificado, setCustoCertificado] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  useEffect(() => {
    const fetchViaturas = async () => {
      const { data, error } = await supabase
        .from("tblviaturas")
        .select("viaturaid, viaturamarca, viaturamatricula");

      if (!error && data) {
        setViaturas(
          data.map((v) => ({
            ...v,
            viaturaid: String(v.viaturaid), // força string
          }))
        );
      }
    };
    fetchViaturas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !viaturaId ||
      !centroInspeccao ||
      !numeroDoQuadro ||
      !quilometragem ||
      !dataHoraInspeccao ||
      !proximaInspeccao ||
      !numeroCertificado
    ) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const dataInspecaoFormatada = format(dataHoraInspeccao, "yyyy/MM/dd");
    const proximaInspecaoFormatada = format(proximaInspeccao, "yyyy/MM/dd");

    try {
        //Calcular data para determinar estado.
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
      const status = calcularStatusLicenca(new Date(proximaInspecaoFormatada));

      let filePath = "";

      if (arquivo) {
        const ext = arquivo.name.split(".").pop();
        filePath = `certificados/${numeroCertificado}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("certificados")
          .upload(filePath, arquivo);
        if (uploadError) throw uploadError;
      }

      const { error: insertError } = await supabase
        .from("tblcertificadoinspeccao")
        .insert([
          {
            viaturaid: viaturaId,
            centroinspeccao: centroInspeccao,
            numerodoquadro: numeroDoQuadro,
            quilometragem: quilometragem,
            datahorainspeccao: dataInspecaoFormatada,
            proximainspeccao: proximaInspecaoFormatada,
            numerocertificado: numeroCertificado,
            copiadocertificado: filePath,
            status: status,
            custodocertificado: custoCertificado ? parseFloat(custoCertificado) : null,
          },
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Certificado salvo",
        description: "O certificado foi registrado com sucesso.",
      });
      navigate("/certificados");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro desconhecido.",
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
          onClick={() => navigate("/certificados")}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Adicionar Certificado
          </h2>
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
                <Label htmlFor="numeroCertificado">
                  Número do Certificado*
                </Label>
                <Input
                  id="numeroCertificado"
                  value={numeroCertificado}
                  onChange={(e) => setNumeroCertificado(e.target.value)}
                  required
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
                <Label htmlFor="centro">Centro de Inspeção*</Label>
                <Input
                  id="centro"
                  value={centroInspeccao}
                  onChange={(e) => setCentroInspeccao(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quadro">Número do Quadro*</Label>
                <Input
                  id="quadro"
                  value={numeroDoQuadro}
                  onChange={(e) => setNumeroDoQuadro(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="km">Odômetro (km)*</Label>
                <Input
                  id="km"
                  value={quilometragem}
                  onChange={(e) => setQuilometragem(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custoCertificado">Custo do Certificado</Label>
                <Input
                  id="custoCertificado"
                  type="number"
                  step="0.01"
                  value={custoCertificado}
                  onChange={(e) => setCustoCertificado(e.target.value)}
                  placeholder="Ex: 1500.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Data da Inspeção*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataHoraInspeccao && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dataHoraInspeccao
                        ? format(dataHoraInspeccao, "dd/MM/yyyy")
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataHoraInspeccao}
                      onSelect={setDataHoraInspeccao}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Próxima Inspeção*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !proximaInspeccao && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {proximaInspeccao
                        ? format(proximaInspeccao, "dd/MM/yyyy")
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={proximaInspeccao}
                      onSelect={setProximaInspeccao}
                      initialFocus
                      locale={ptBR}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo (PDF ou imagem)*</Label>
                <Input
                  type="file"
                  id="arquivo"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  required
                />
              </div>
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
