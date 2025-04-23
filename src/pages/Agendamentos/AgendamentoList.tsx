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

// Mock data adaptado ao modelo Prisma Agendamento
const agendamentosMock = [
  {
    id: 1,
    userId: 10,
    viaturaId: 101,
    tipoId: 5,
    dataAgendada: "2025-04-25T10:00:00Z",
    status: "Pendente",
    usuario: { nome: "João Silva" },
    viatura: { matricula: "ABC-1234", modelo: "Toyota Hilux" },
    tipo: { nome: "Troca de Óleo" },
  },
  {
    id: 2,
    userId: 11,
    viaturaId: 102,
    tipoId: 6,
    dataAgendada: "2025-04-26T15:00:00Z",
    status: "Concluído",
    usuario: { nome: "Maria Oliveira" },
    viatura: { matricula: "XYZ-5678", modelo: "Ford Ranger" },
    tipo: { nome: "Revisão Geral" },
  },
];

interface AgendamentoDetailsProps {
  agendamento: typeof agendamentosMock[0] | null;
  onClose: () => void;
}

const AgendamentoDetails = ({ agendamento, onClose }: AgendamentoDetailsProps) => {
  if (!agendamento) return null;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Detalhes do Agendamento</DialogTitle>
        <DialogDescription>
          Informações detalhadas do agendamento
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileCheck className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className={`p-2 rounded ${getStatusClass(agendamento.status)}`}>
          <p className="text-sm font-medium text-center capitalize">
            {agendamento.status}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="text-sm font-medium">{agendamento.tipo.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Responsável</p>
            <p className="text-sm font-medium">{agendamento.usuario.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data Agendada</p>
            <p className="text-sm font-medium">
              {new Date(agendamento.dataAgendada).toLocaleString("pt-PT")}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Viatura</p>
          <p className="text-sm font-medium">
            {agendamento.viatura.modelo} ({agendamento.viatura.matricula})
          </p>
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

const AgendamentoList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAgendamento, setSelectedAgendamento] = useState<typeof agendamentosMock[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setAgendamentoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Agendamento excluído",
      description: `O agendamento foi excluído com sucesso.`,
    });
    setShowDeleteDialog(false);
  };

  const viewDetails = (agendamento: typeof agendamentosMock[0]) => {
    setSelectedAgendamento(agendamento);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluído":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
      case "Pendente":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      case "Cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
          <p className="text-muted-foreground">
            Gerenciamento de agendamentos de serviços
          </p>
        </div>
        <Button onClick={() => navigate("/agendamentos/add")}> <Plus className="mr-2 h-4 w-4" /> Novo Agendamento </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <CardDescription>
            Agendamentos registrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Viatura</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendamentosMock.map((agendamento) => (
                <TableRow key={agendamento.id}>
                  <TableCell>
                    {agendamento.viatura.modelo} ({agendamento.viatura.matricula})
                  </TableCell>
                  <TableCell>{agendamento.tipo.nome}</TableCell>
                  <TableCell>
                    {new Date(agendamento.dataAgendada).toLocaleString("pt-PT")}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(agendamento.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(agendamento)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/agendamentos/edit/${agendamento.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(agendamento.id)} className="text-destructive focus:text-destructive">
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
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
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

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <AgendamentoDetails 
          agendamento={selectedAgendamento} 
          onClose={() => setShowDetailsDialog(false)} 
        />
      </Dialog>
    </div>
  );
};

export default AgendamentoList;

