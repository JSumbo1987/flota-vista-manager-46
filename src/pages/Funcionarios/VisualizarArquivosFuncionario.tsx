import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FuncionarioArquivos {
  copiabi: string | null;
  copiacartaconducao: string | null;
  copialicencaconducao: string | null;
  fotografia: string | null;
}

interface SignedUrls {
  copiabi?: string | null;
  copiacartaconducao?: string | null;
  copialicencaconducao?: string | null;
  fotografia?: string | null;
}

const VisualizarArquivosFuncionario = () => {
  const { funcionarioid } = useParams<{ funcionarioid: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [arquivos, setArquivos] = useState<FuncionarioArquivos | null>(null);
  const [signedUrls, setSignedUrls] = useState<SignedUrls>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArquivos() {
      if (!funcionarioid) return;

      const { data, error } = await supabase
        .from("tblfuncionarios")
        .select("copiabi, copiacartaconducao, copialicencaconducao, fotografia")
        .eq("funcionarioid", funcionarioid)
        .single();

      if (error) {
        toast({
          title: "Erro ao buscar arquivos",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setArquivos(data);
        await gerarSignedUrls(data);
      }

      setIsLoading(false);
    }

    async function gerarSignedUrls(data: FuncionarioArquivos) {
      const signedUrlsTemp: SignedUrls = {};

      for (const [key, path] of Object.entries(data)) {
        if (path) {
          const { data: signedData, error } = await supabase
            .storage
            .from('funcionarios')
            .createSignedUrl(path, 60); // URL válida por 60 segundos

          if (signedData?.signedUrl) {
            signedUrlsTemp[key as keyof FuncionarioArquivos] = signedData.signedUrl;
          } else if (error) {
            console.error(`Erro ao gerar signed URL para ${key}:`, error.message);
          }
        }
      }

      setSignedUrls(signedUrlsTemp);
    }

    fetchArquivos();
  }, [funcionarioid, toast]);

  const arquivosLabels = {
    copiabi: "Cópia do BI",
    copiacartaconducao: "Cópia da Carta de Condução",
    copialicencaconducao: "Cópia da Licença de Condução",
    fotografia: "Fotografia",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/funcionarios")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Arquivos do Funcionário</h2>
          <p className="text-muted-foreground">Lista de arquivos disponíveis para visualização</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arquivos</CardTitle>
          <CardDescription>Visualize os documentos enviados para o funcionário.</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Carregando arquivos...</p>
          ) : !arquivos ? (
            <p className="text-muted-foreground">Nenhum arquivo encontrado.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(arquivosLabels).map(([key, label]) => {
                const signedUrl = signedUrls[key as keyof FuncionarioArquivos];
                return signedUrl ? (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 border rounded hover:bg-muted cursor-pointer"
                    onClick={() => window.open(signedUrl, "_blank")}
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold">{label}</p>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(signedUrl, "_blank");
                      }}
                    >
                      Visualizar
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => navigate("/funcionarios")}>
            Voltar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VisualizarArquivosFuncionario;

