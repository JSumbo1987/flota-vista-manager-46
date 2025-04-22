
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, FileCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock data para certificados
const certificadosMock = [
  {
    id: "1",
    numero: "CERT-001-2024",
    viatura: "Toyota Hilux (ABC-1234)",
    dataEmissao: "2024-01-15",
    dataValidade: "2025-01-15",
    entidadeEmissora: "INATTER",
    status: "válido",
  },
  {
    id: "2",
    numero: "CERT-002-2024",
    viatura: "Ford Ranger (XYZ-5678)",
    dataEmissao: "2023-11-20",
    dataValidade: "2024-05-20",
    entidadeEmissora: "INATTER",
    status: "a_vencer",
  },
  {
    id: "3",
    numero: "CERT-003-2023",
    viatura: "Mitsubishi L200 (DEF-9012)",
    dataEmissao: "2023-08-05",
    dataValidade: "2024-02-05",
    entidadeEmissora: "INATTER",
    status: "expirado",
  },
  {
    id: "4",
    numero: "CERT-004-2023",
    viatura: "Volkswagen Amarok (GHI-3456)",
    dataEmissao: "2023-09-12",
    dataValidade: "2024-09-12",
    entidadeEmissora: "INATTER",
    status: "válido",
  },
  {
    id: "5",
    numero: "CERT-005-2024",
    viatura: "Chevrolet S10 (JKL-7890)",
    dataEmissao: "2024-02-28",
    dataValidade: "2025-02-28",
    entidadeEmissora: "INATTER",
    status: "válido",
  },
];

interface CertificadoDetailsProps {
  certificado: typeof certificadosMock[0] | null;
  onClose: () => void;
}

const CertificadoDetails = ({ certificado, onClose }: CertificadoDetailsProps) => {
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

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Detalhes do Certificado</DialogTitle>
        <DialogDescription>
          Informações detalhadas do certificado de inspeção
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Número</p>
            <p className="text-sm font-medium">{certificado.numero}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entidade Emissora</p>
            <p className="text-sm font-medium">{certificado.entidadeEmissora}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data de Emissão</p>
            <p className="text-sm font-medium">
              {new Date(certificado.dataEmissao).toLocaleDateString("pt-PT")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data de Validade</p>
            <p className="text-sm font-medium">
              {new Date(certificado.dataValidade).toLocaleDateString("pt-PT")}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Viatura</p>
          <p className="text-sm font-medium">{certificado.viatura}</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={() => {}}>
          Editar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const CertificadosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCertificado, setSelectedCertificado] = useState<typeof certificadosMock[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [certificadoToDelete, setCertificadoToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setCertificadoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // TODO: Implementar deleção real via Supabase
    toast({
      title: "Certificado excluído",
      description: `O certificado foi excluído com sucesso.`,
    });
    setShowDeleteDialog(false);
  };

  const viewDetails = (certificado: typeof certificadosMock[0]) => {
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
          <p className="text-muted-foreground">
            Gerenciamento de certificados de inspeção das viaturas
          </p>
        </div>
        <Button onClick={() => navigate("/certificados/add")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Certificado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Certificados</CardTitle>
          <CardDescription>
            Certificados de inspeção registrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Viatura</TableHead>
                <TableHead>Data de Emissão</TableHead>
                <TableHead>Data de Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificadosMock.map((certificado) => (
                <TableRow key={certificado.id}>
                  <TableCell className="font-medium">{certificado.numero}</TableCell>
                  <TableCell>{certificado.viatura}</TableCell>
                  <TableCell>
                    {new Date(certificado.dataEmissao).toLocaleDateString("pt-PT")}
                  </TableCell>
                  <TableCell>
                    {new Date(certificado.dataValidade).toLocaleDateString("pt-PT")}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(certificado.status)}
                  </TableCell>
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
                        <DropdownMenuItem 
                          onClick={() => navigate(`/certificados/edit/${certificado.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(certificado.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este certificado? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalhes do certificado */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <CertificadoDetails 
          certificado={selectedCertificado} 
          onClose={() => setShowDetailsDialog(false)} 
        />
      </Dialog>
    </div>
  );
};

export default CertificadosList;
