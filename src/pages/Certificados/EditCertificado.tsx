
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import CertificadoHeader from "@/components/certificados/CertificadoHeader";
import CertificadoForm from "@/components/certificados/CertificadoForm";

const EditCertificado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificado, setCertificado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificado = async () => {
      try {
        const { data, error } = await supabase
          .from("tblcertificadoinspeccao")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setCertificado({
            id: data.id,
            viaturaId: String(data.viaturaid),
            centroInspeccao: data.centroinspeccao,
            numeroDoQuadro: data.numerodoquadro,
            quilometragem: data.quilometragem,
            dataHoraInspeccao: new Date(data.datahorainspeccao),
            proximaInspeccao: new Date(data.proximainspeccao),
            numeroCertificado: data.numerocertificado,
            arquivoExistente: data.copiadocertificado || "",
            custoCertificado: data.custocertificado ? data.custocertificado.toString() : "",
          });
          
          // Fetch signed URL if there's a file
          if (data.copiadocertificado) {
            fetchSignedUrl(data.copiadocertificado);
          }
        }
      } catch (error: any) {
        console.error("Error fetching certificate:", error);
        toast({
          title: "Erro ao carregar certificado",
          description: error.message || "Não foi possível carregar os dados do certificado",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCertificado();
  }, [id, toast]);

  const fetchSignedUrl = async (path: string) => {
    if (!path) return;
    
    const { data, error } = await supabase.storage
      .from('certificados')
      .createSignedUrl(path, 60);
      
    if (error) {
      console.error(error);
    } else {
      setSignedUrl(data?.signedUrl ?? null);
    }
  };

  const handleSuccess = () => {
    navigate("/certificados");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-lg">Carregando dados do certificado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CertificadoHeader
        title="Editar Certificado"
        description="Atualize os dados do certificado de inspeção"
      />
      {certificado && (
        <CertificadoForm 
          initialData={certificado} 
          onSuccess={handleSuccess}
          signedUrl={signedUrl}
          isEditing
        />
      )}
    </div>
  );
};

export default EditCertificado;
