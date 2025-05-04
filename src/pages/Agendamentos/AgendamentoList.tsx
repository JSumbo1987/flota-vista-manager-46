import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabaseClient";
import { usePermissao } from "@/hooks/usePermissao";

interface Agendamento {
  id: number;
  userId: number;
  viaturaId: number;
  tipoId: number;
  dataagendada: string;
  status: string;
  tblusuarios: { usernome: string };
  tblviaturas: { viaturamarca: string, viaturamodelo: string; viaturamatricula: string };
  tbltipoassistencia: { nome: string };
}

const AgendamentoDetails = ({ agendamento, onClose }: { agendamento: Agendamento | null; onClose: () => void }) => {
  if (!agendamento) return null;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Concluído": return "bg-green-100 text-green-800 border-green-200";
      case "Pendente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Detalhes do Agendamento</DialogTitle>
        <DialogDescription>Informações detalhadas do agendamento</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className={`p-2 rounded ${getStatusClass(agendamento.status)}`}>
          <p className="text-sm font-medium text-center capitalize">{agendamento.status}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="text-sm font-medium">{agendamento.tbltipoassistencia?.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Responsável</p>
            <p className="text-sm font-medium">{agendamento.tblusuarios?.usernome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data Agendada</p>
            <p className="text-sm font-medium">{agendamento.dataagendada}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Viatura</p>
            <p className="text-sm font-medium">{agendamento.tblviaturas?.viaturamarca} ( {agendamento.tblviaturas?.viaturamodelo} )</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Matrícula</p>
            <p className="text-sm font-medium">{agendamento.tblviaturas?.viaturamatricula}</p>
          </div>
        </div>
        
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const AgendamentoList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [selectedAgendamento, setSelectedAgendamento] = useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<number | null>(null);
  const { temPermissao } = usePermissao();

  useEffect(() => {
    const fetchAgendamentos = async () => {
      const { data, error } = await supabase
        .from("tblagendamentoservico")
        .select(`*,
          tblusuarios:userid(usernome),
          tblviaturas:viaturaid(viaturamarca, viaturamodelo, viaturamatricula),
          tbltipoassistencia:tipoid(nome)
        `);
      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } else {
        setAgendamentos(data);
      }
    };

    fetchAgendamentos();
  }, []);

  const handleDelete = (id: number) => {
    setAgendamentoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    toast({ title: "Agendamento excluído", description: `O agendamento foi excluído com sucesso.` });
    setShowDeleteDialog(false);
  };

  const viewDetails = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluído": return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
      case "Pendente": return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      case "Cancelado": return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!temPermissao('agendamentos',"canview")) {
    return <p>Você não tem permissão para visualizar esta página.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
          <p className="text-muted-foreground">Gerenciamento de agendamentos de serviços</p>
        </div>
        {temPermissao("agendamentos","canview") && (<Button onClick={() => navigate("/agendamentos/add")}> 
          <Plus className="mr-2 h-4 w-4" /> Novo Agendamento 
        </Button>)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <CardDescription>Agendamentos registrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Viatura</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendamentos.map((agendamento) => (
                <TableRow key={agendamento.id}>
                  <TableCell>{agendamento.tblviaturas?.viaturamarca} - ( {agendamento.tblviaturas?.viaturamodelo} )</TableCell>
                  <TableCell>{agendamento.tblviaturas?.viaturamatricula}</TableCell>
                  <TableCell>{agendamento.tbltipoassistencia?.nome}</TableCell>
                  <TableCell>{new Date(agendamento.dataagendada).toLocaleDateString("pt-PT", {
                              day: "2-digit",month: "2-digit", year: "numeric",})}</TableCell>
                  <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {temPermissao("agendamentos","canview") && (<DropdownMenuItem onClick={() => viewDetails(agendamento)}>
                          <EyeIcon className="mr-2 h-4 w-4" /> Ver detalhes
                        </DropdownMenuItem>)}
                        {temPermissao("agendamentos","canedit") && (<DropdownMenuItem onClick={() => navigate(`/agendamentos/edit/${agendamento.id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>)}
                        {temPermissao("agendamentos","candelete") && (<DropdownMenuItem onClick={() => handleDelete(agendamento.id)} className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {agendamentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este agendamento?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <AgendamentoDetails agendamento={selectedAgendamento} onClose={() => setShowDetailsDialog(false)} />
      </Dialog>
    </div>
  );
};

export default AgendamentoList;
