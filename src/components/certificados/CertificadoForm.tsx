
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import DateSelector from "./DateSelector";
import { calcularStatusCertificado } from "@/utils/certificadoUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Viatura {
  viaturaid: string;
  viaturamarca: string;
  viaturamatricula: string;
}

interface CertificadoFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

const CertificadoForm = ({ onSuccess, initialData }: CertificadoFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viaturas, setViaturas] = useState<Viatura[]>([]);

  const [viaturaId, setViaturaId] = useState(initialData?.viaturaId || "");
  const [centroInspeccao, setCentroInspeccao] = useState(initialData?.centroInspeccao || "");
  const [numeroDoQuadro, setNumeroDoQuadro] = useState(initialData?.numeroDoQuadro || "");
  const [quilometragem, setQuilometragem] = useState(initialData?.quilometragem || "");
  const [dataHoraInspeccao, setDataHoraInspeccao] = useState<Date | undefined>(
    initialData?.dataHoraInspeccao ? new Date(initialData.dataHoraInspeccao) : new Date()
  );
  const [proximaInspeccao, setProximaInspeccao] = useState<Date | undefined>(
    initialData?.proximaInspeccao ? new Date(initialData.proximaInspeccao) : undefined
  );
  const [numeroCertificado, setNumeroCertificado] = useState(initialData?.numeroCertificado || "");
  const [custoCertificado, setCustoCertificado] = useState(initialData?.custoCertificado || "");
  const [arquivo, setArquivo] = useState<File | null>(null);

  // Fetch viaturas on component mount
  useState(() => {
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
  });

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
      const status = calcularStatusCertificado(new Date(proximaInspecaoFormatada));

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
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/certificados");
      }
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
            <DateSelector
              label="Data da Inspeção"
              selected={dataHoraInspeccao}
              onSelect={setDataHoraInspeccao}
              required
            />
            <DateSelector
              label="Próxima Inspeção"
              selected={proximaInspeccao}
              onSelect={setProximaInspeccao}
              disablePastDates={true}
              required
            />
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
  );
};

export default CertificadoForm;
