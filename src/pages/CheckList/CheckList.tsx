import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, ClipboardList } from "lucide-react";
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

// MOCK DATA (Exemplo)
const checklistMock = [
  {
    id: 1,
    viatura: "Toyota Hilux (ABC-1234)",
    motorista: "Carlos Manuel",
    odometro: 123456.78,
    nivelCombustivel: "Meio tanque",
    condicaoPneus: "Calibrado",
    observacao: "Tudo ok",
    dataCheckList: "2025-04-20",
    status: "Aprovado",
  },
  {
    id: 2,
    viatura: "Ford Ranger (XYZ-5678)",
    motorista: "Ana Silva",
    odometro: 87654.32,
    nivelCombustivel: "Reserva",
    condicaoPneus: "Troca necessária",
    observacao: "Pneu dianteiro desgastado",
    dataCheckList: "2025-04-18",
    status: "Pendências",
  },
];

const ChecklistDetails = ({ checklist, onClose }: { checklist: typeof checklistMock[0] | null, onClose: () => void }) => {
  if (!checklist) return null;

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Detalhes do Checklist</DialogTitle>
        <DialogDescription>Informações do checklist da viatura</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Viatura</p>
            <p className="text-sm font-medium">{checklist.viatura}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Motorista</p>
            <p className="text-sm font-medium">{checklist.motorista}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Odômetro</p>
            <p className="text-sm font-medium">{checklist.odometro.toLocaleString()} km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Combustível</p>
            <p className="text-sm font-medium">{checklist.nivelCombustivel}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pneus</p>
            <p className="text-sm font-medium">{checklist.condicaoPneus}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm font-medium">{checklist.status}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Data</p>
            <p className="text-sm font-medium">
              {new Date(checklist.dataCheckList).toLocaleDateString("pt-PT")}
            </p>
          </div>
        </div>
        {checklist.observacao && (
          <div>
            <p className="text-sm text-muted-foreground">Observações</p>
            <p className="text-sm font-medium">{checklist.observacao}</p>
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

const ChecklistsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedChecklist, setSelectedChecklist] = useState<typeof checklistMock[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setChecklistToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Checklist excluído",
      description: `O checklist foi removido com sucesso.`,
    });
    setShowDeleteDialog(false);
  };

  const viewDetails = (checklist: typeof checklistMock[0]) => {
    setSelectedChecklist(checklist);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Checklists</h2>
          <p className="text-muted-foreground">Listagem de checklists de viaturas</p>
        </div>
        <Button onClick={() => navigate("/checklist/add")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Checklist
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Checklists</CardTitle>
          <CardDescription>Checklists cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Viatura</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Odômetro</TableHead>
                <TableHead>Combustível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklistMock.map((checklist) => (
                <TableRow key={checklist.id}>
                  <TableCell>{checklist.viatura}</TableCell>
                  <TableCell>{checklist.motorista}</TableCell>
                  <TableCell>{new Date(checklist.dataCheckList).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>{checklist.odometro.toLocaleString()} km</TableCell>
                  <TableCell>{checklist.nivelCombustivel}</TableCell>
                  <TableCell>{checklist.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(checklist)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/checklists/edit/${checklist.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(checklist.id)}
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
              Tem certeza que deseja excluir este checklist? Essa ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <ChecklistDetails checklist={selectedChecklist} onClose={() => setShowDetailsDialog(false)} />
      </Dialog>
    </div>
  );
};

export default ChecklistsList;