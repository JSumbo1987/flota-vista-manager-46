
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { useSanitizedUpload } from "@/hooks/useSanitizedUpload";
import { AlertCircle, CheckCircle } from "lucide-react";

interface Viatura {
  viaturaid: string;
  viaturamarca: string;
  viaturamatricula: string;
}

interface CertificadoFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
  signedUrl?: string | null;
  matriculaViatura?: string | null;
}

const CertificadoForm = ({ 
  onSuccess, 
  initialData, 
  isEditing = false,
  signedUrl,
  matriculaViatura 
}: CertificadoFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const { uploadFile } = useSanitizedUpload();
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
  const [arquivoExistente, setArquivoExistente] = useState(initialData?.arquivoExistente || "");
  const [matriculaInput, setMatriculaInput] = useState("");
  const [viaturaEncontrada, setViaturaEncontrada] = useState(false);

  // Fetch viaturas on component mount
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

  useEffect(() => {
    if (matriculaViatura && viaturas.length > 0) {
      const input = matriculaViatura.toUpperCase();
      setMatriculaInput(input);
  
      const encontrada = viaturas.find(
        (v) => v.viaturamatricula.toUpperCase() === input
      );
  
      if (encontrada) {
        setViaturaId(encontrada.viaturaid);
        setViaturaEncontrada(true);
      } else {
        setViaturaId("");
        setViaturaEncontrada(false);
      }
    }
  }, [matriculaViatura, viaturas]);
  
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

      let filePath = arquivoExistente;

      if (arquivo) {
        // 1. Upload do arquivo
        filePath = await uploadFile(arquivo, "certificados");
      }

      const certificadoData = {
        viaturaid: viaturaId,
        centroinspeccao: centroInspeccao,
        numerodoquadro: numeroDoQuadro,
        quilometragem: quilometragem,
        datahorainspeccao: dataInspecaoFormatada,
        proximainspeccao: proximaInspecaoFormatada,
        numerocertificado: numeroCertificado,
        copiadocertificado: filePath || null,
        status: status,
        custocertificado: custoCertificado ? parseFloat(custoCertificado) : null,
      };

      if (isEditing && initialData?.id) {
        // Update existing certificate
        const { error } = await supabase
          .from("tblcertificadoinspeccao")
          .update(certificadoData)
          .eq("id", initialData.id);

        if (error) throw error;

        toast({
          title: "Certificado atualizado",
          description: "O certificado foi editado com sucesso.",
        });
      } else {
        // Create new certificate
        const { error } = await supabase
          .from("tblcertificadoinspeccao")
          .insert([certificadoData]);

        if (error) throw error;

        toast({
          title: "Certificado salvo",
          description: "O certificado foi registrado com sucesso.",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/certificados");
      }
    } catch (error) {
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
            {isEditing ? "Altere os dados do certificado de inspeção" : "Preencha os dados do certificado de inspeção"}
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
              <Label htmlFor="matricula">Matrícula da Viatura*</Label>
              <div className="relative">
                  <Input
                  id="matricula"
                  value={matriculaInput}
                  onChange={handleMatriculaChange}
                  placeholder="Digite a matrícula (ex: AB-12-CD)"
                  required
                  readOnly={!!matriculaViatura}
                  />
                  {matriculaInput !== "" && (viaturaEncontrada ? ( <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />)
                  :(<AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />))}
              </div>
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
              <Label htmlFor="arquivo">
                Arquivo (PDF ou imagem){isEditing && arquivoExistente ? " (já existente)" : isEditing ? "" : "*"}
              </Label>
              {isEditing && arquivoExistente && signedUrl && (
                <div className="mb-2">
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Visualizar arquivo atual
                  </a>
                </div>
              )}
              <Input
                type="file"
                id="arquivo"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                required={!isEditing || !arquivoExistente}
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
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Salvar Certificado"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CertificadoForm;
