import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, Wrench } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

// MOCK para teste
const servicosMock = [
  {
    id: 1,
    viatura: "Toyota Hilux (ABC-1234)",
    tipo: "Revisão",
    categoria: "Preventiva",
    prestador: "Oficina Central",
    dataServico: "2024-03-10",
    custo: "45000.00",
    observacoes: "Troca de óleo e filtros.",
  },
  {
    id: 2,
    viatura: "Ford Ranger (XYZ-5678)",
    tipo: "Manutenção",
    categoria: "Corretiva",
    prestador: "Auto Mecânica Luanda",
    dataServico: "2024-04-01",
    custo: "120000.00",
    observacoes: "Troca do sistema de embreagem.",
  },
];

const ServicoDetails = ({ servico, onClose }: { servico: typeof servicosMock[0] | null, onClose: () => void }) => {
  if (!servico) return null;

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Detalhes do Serviço</DialogTitle>
        <DialogDescription>
          Informações detalhadas sobre o serviço realizado
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Viatura</p>
            <p className="text-sm font-medium">{servico.viatura}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="text-sm font-medium">{servico.tipo}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Categoria</p>
            <p className="text-sm font-medium">{servico.categoria}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Prestador</p>
            <p className="text-sm font-medium">{servico.prestador}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data do Serviço</p>
            <p className="text-sm font-medium">
              {new Date(servico.dataServico).toLocaleDateString("pt-PT")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Custo</p>
            <p className="text-sm font-medium">Kz {parseFloat(servico.custo).toLocaleString()}</p>
          </div>
        </div>
        {servico.observacoes && (
          <div>
            <p className="text-sm text-muted-foreground">Observações</p>
            <p className="text-sm font-medium">{servico.observacoes}</p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button onClick={() => {}}>Editar</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ServicosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedServico, setSelectedServico] = useState<typeof servicosMock[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setServicoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Serviço excluído",
      description: `O serviço foi excluído com sucesso.`,
    });
    setShowDeleteDialog(false);
  };

  const viewDetails = (servico: typeof servicosMock[0]) => {
    setSelectedServico(servico);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground">Lista de serviços realizados nas viaturas</p>
        </div>
        <Button onClick={() => navigate("/servicos/add")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>Serviços cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Viatura</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prestador</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicosMock.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell>{servico.viatura}</TableCell>
                  <TableCell>{servico.tipo}</TableCell>
                  <TableCell>{servico.categoria}</TableCell>
                  <TableCell>{servico.prestador}</TableCell>
                  <TableCell>{new Date(servico.dataServico).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>Kz {parseFloat(servico.custo).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(servico)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/servicos/edit/${servico.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(servico.id)}
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Deseja realmente excluir este serviço? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <ServicoDetails servico={selectedServico} onClose={() => setShowDetailsDialog(false)} />
      </Dialog>
    </div>
  );
};

export default ServicosList;