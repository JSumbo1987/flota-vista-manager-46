import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, FileCheck } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
interface Certificado {
  id: string;
  numerocertificado: string;
  centroinspeccao: string;
  datahorainspeccao: string;
  proximainspeccao: string;
  tblviaturas: {
    viaturamatricula: string;
    viaturamodelo: string;
    viaturamarca: string; 
  };
  entidadeEmissora: string;
  status: "válido" | "a_vencer" | "expirado";
  copiadocertificado?: string; // novo campo
}

interface CertificadoDetailsProps {
  certificado: Certificado | null;
  onClose: () => void;
}

const CertificadoDetails = ({ certificado, onClose }: CertificadoDetailsProps) => {
const [signedUrl, setSignedUrl] = useState<string | null>(null);

  if (!certificado) return null;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "válido":
        return "bg-green-100 text-green-800 border-green-200";
      case "a_vencer":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "expirado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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

  // Gerar a URL privada e com token para o documento (se houver)
  if (certificado.copiadocertificado) {
    fetchSignedUrl(certificado.copiadocertificado);
  }
  
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Detalhes do Certificado</DialogTitle>
        <DialogDescription>Informações detalhadas do certificado de inspeção</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className={`p-2 rounded ${getStatusClass(certificado.status)}`}>
          <p className="text-sm font-medium text-center capitalize">
            {certificado.status === "a_vencer" ? "A vencer" : certificado.status}
          </p>
        </div>

        {/* Informações */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Número</p>
            <p className="text-sm font-medium">{certificado.numerocertificado}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entidade Emissora</p>
            <p className="text-sm font-medium">{certificado.centroinspeccao}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data de Emissão</p>
            <p className="text-sm font-medium">
              {new Date(certificado.datahorainspeccao).toLocaleDateString("pt-PT")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data de Validade</p>
            <p className="text-sm font-medium">
              {new Date(certificado.proximainspeccao).toLocaleDateString("pt-PT")}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Viatura</p>
          <p className="text-sm font-medium">{certificado.tblviaturas?.viaturamarca} ( {certificado.tblviaturas?.viaturamatricula} )</p>
        </div>
          {/* Documento (PDF ou imagem) */}
          {signedUrl && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Documento Anexado:</p>
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Visualizar documento em anexo
            </a>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  );
};


const CertificadosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [selectedCertificado, setSelectedCertificado] = useState<Certificado | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [certificadoToDelete, setCertificadoToDelete] = useState<string | null>(null);

  //Listar Todos os Certificados Cadastrados.
  const fetchCertificados = async () => {
    const { data, error } = await supabase
      .from("tblcertificadoinspeccao")
      .select(`*,
        tblviaturas:viaturaid (viaturamarca, viaturamodelo, viaturamatricula)
      `);

    if (error) {
      console.error("Erro ao buscar certificados:", error.message);
      toast({ title: "Erro", description: "Não foi possível carregar os certificados." });
      return;
    }
    setCertificados(data);
  };

  useEffect(() => {
    fetchCertificados();
  }, [toast]);

  const handleDelete = (id: string) => {
    setCertificadoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!certificadoToDelete) {
      toast({
        title: "Erro",
        description: "ID do certificado não encontrado.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      // 1. Buscar o certificado pelo ID
      const { data: certificado, error: fetchError } = await supabase
        .from("tblcertificadoinspeccao")
        .select("copiadocertificado")
        .eq("id", certificadoToDelete)
        .single();
  
      if (fetchError) throw fetchError;
  
      const caminhoArquivo = certificado?.copiadocertificado;
  
      // 2. Deletar o certificado do banco
      const { error: deleteError } = await supabase
        .from("tblcertificadoinspeccao")
        .delete()
        .eq("id", certificadoToDelete);
  
      if (deleteError) throw deleteError;
  
      // 3. Se existir arquivo, deletar do storage
      if (caminhoArquivo) {
        const { error: storageError } = await supabase.storage
          .from("certificados")
          .remove([caminhoArquivo]);
  
        if (storageError) {
          console.error("Erro ao deletar do storage:", storageError.message);
        }
      }
  
      toast({
        title: "Certificado excluído",
        description: "O certificado foi excluído com sucesso.",
      });
  
      setShowDeleteDialog(false);
      setCertificadoToDelete(null);
      fetchCertificados();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Erro desconhecido.",
        variant: "destructive",
      });
    }
  };
  
  const viewDetails = (certificado: Certificado) => {
    setSelectedCertificado(certificado);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "válido":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Válido</Badge>;
      case "a_vencer":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">A vencer</Badge>;
      case "expirado":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Certificados de Inspeção</h2>
          <p className="text-muted-foreground">Gerenciamento de certificados de inspeção das viaturas</p>
        </div>
        <Button onClick={() => navigate("/certificados/add")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Certificado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Certificados</CardTitle>
          <CardDescription>Certificados de inspeção registrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Viatura</TableHead>
                <TableHead>Centro de Inspeção</TableHead>
                <TableHead>Data de Emissão</TableHead>
                <TableHead>Proxima Inspeção</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificados.map((certificado) => (
                <TableRow key={certificado.id}>
                  <TableCell className="font-medium">{certificado.numerocertificado}</TableCell>
                  <TableCell>{certificado.tblviaturas?.viaturamarca}</TableCell>
                  <TableCell>{certificado.centroinspeccao}</TableCell>
                  <TableCell>{new Date(certificado.datahorainspeccao).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>{new Date(certificado.proximainspeccao).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>{getStatusBadge(certificado.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(certificado)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/certificados/edit/${certificado.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(certificado.id)} className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {certificados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhum certificado de inspeção encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este certificado? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <CertificadoDetails certificado={selectedCertificado} onClose={() => setShowDetailsDialog(false)} />
      </Dialog>
    </div>
  );
};

export default CertificadosList;

