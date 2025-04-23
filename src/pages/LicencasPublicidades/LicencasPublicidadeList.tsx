import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, BadgePercent } from "lucide-react";
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

const licencasMock = [
  {
    id: "1",
    numero: "LICPUB-001-2024",
    viatura: "Toyota Hilux (ABC-1234)",
    dataInicio: "2024-01-01",
    dataFim: "2024-12-31",
    entidadeEmissora: "Administração Municipal",
    status: "válido",
  },
  {
    id: "2",
    numero: "LICPUB-002-2024",
    viatura: "Ford Ranger (XYZ-5678)",
    dataInicio: "2023-07-01",
    dataFim: "2024-07-01",
    entidadeEmissora: "Administração Municipal",
    status: "a_vencer",
  },
  {
    id: "3",
    numero: "LICPUB-003-2023",
    viatura: "Mitsubishi L200 (DEF-9012)",
    dataInicio: "2022-01-01",
    dataFim: "2023-01-01",
    entidadeEmissora: "Administração Municipal",
    status: "expirado",
  },
];

const LicencaPublicidadeList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLicenca, setSelectedLicenca] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [licencaToDelete, setLicencaToDelete] = useState(null);

  const handleDelete = (id) => {
    setLicencaToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Licença excluída",
      description: `A licença foi excluída com sucesso.`,
    });
    setShowDeleteDialog(false);
  };

  const viewDetails = (licenca) => {
    setSelectedLicenca(licenca);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status) => {
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
          <h2 className="text-3xl font-bold tracking-tight">Licenças de Publicidade</h2>
          <p className="text-muted-foreground">
            Gerenciamento das licenças de publicidade das viaturas
          </p>
        </div>
        <Button onClick={() => navigate("/licencas-publicidade/add")}> 
          <Plus className="mr-2 h-4 w-4" /> Nova Licença
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Licenças</CardTitle>
          <CardDescription>
            Licenças de publicidade registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Viatura</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Data de Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licencasMock.map((licenca) => (
                <TableRow key={licenca.id}>
                  <TableCell className="font-medium">{licenca.numero}</TableCell>
                  <TableCell>{licenca.viatura}</TableCell>
                  <TableCell>{new Date(licenca.dataInicio).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>{new Date(licenca.dataFim).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>{getStatusBadge(licenca.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(licenca)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/licencas-publicidade/edit/${licenca.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(licenca.id)} className="text-destructive focus:text-destructive">
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

      {/* Diálogo de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta licença? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        {selectedLicenca && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes da Licença</DialogTitle>
              <DialogDescription>Informações detalhadas da licença de publicidade</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BadgePercent className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className={`p-2 rounded ${selectedLicenca.status === "válido" ? "bg-green-100 text-green-800 border-green-200" : selectedLicenca.status === "a_vencer" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                <p className="text-sm font-medium text-center capitalize">{selectedLicenca.status.replace("_", " ")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="text-sm font-medium">{selectedLicenca.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entidade Emissora</p>
                  <p className="text-sm font-medium">{selectedLicenca.entidadeEmissora}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="text-sm font-medium">{new Date(selectedLicenca.dataInicio).toLocaleDateString("pt-PT")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Fim</p>
                  <p className="text-sm font-medium">{new Date(selectedLicenca.dataFim).toLocaleDateString("pt-PT")}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Viatura</p>
                <p className="text-sm font-medium">{selectedLicenca.viatura}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
              <Button onClick={() => navigate(`/licencas-publicidade/edit/${selectedLicenca.id}`)}>Editar</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default LicencaPublicidadeList;