import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, FileCheck, Filter, Edit2Icon, RefreshCw } from "lucide-react";
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
import Pagination from "@/components/paginacao/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EstadoServicoModal from "@/components/agendamentos/EstadoAgendamentoModal";
import { title } from "process";
import { Toast } from "@/components/ui/toast";

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
      case "concluido": return "bg-green-100 text-green-800 border-green-200";
      case "agendado": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "em_atendimento": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "cancelado": return "bg-red-100 text-red-800 border-red-200";
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
            <p className="text-sm text-muted-foreground">Viatura</p>
            <p className="text-sm font-medium">{agendamento.tblviaturas?.viaturamarca} ( {agendamento.tblviaturas?.viaturamodelo} )</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Matrícula</p>
            <p className="text-sm font-medium">{agendamento.tblviaturas?.viaturamatricula}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="text-sm font-medium">{agendamento.tbltipoassistencia?.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data Agendada</p>
            <p className="text-sm font-medium">{agendamento.dataagendada}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Observação</p>
            <p className="text-sm font-medium">{agendamento.observacao}</p>
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
  const [filtroMatricula, setFiltroMatricula] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false)
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null)

  //Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const agendamentoFiltradas = agendamentos.filter((agendamento) => {
    const correspondeMatricula = 
      agendamento.tblviaturas.viaturamatricula.toLowerCase().includes(filtroMatricula.toLowerCase());
      const correspondeEstado = filtroEstado === "todos" || agendamento.status === filtroEstado;
    return correspondeMatricula && correspondeEstado;
  });
  const currentAgendamentos = agendamentoFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  //Fim paginação

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    const { data, error } = await supabase
      .from("tblagendamentoservico")
      .select(`*,
        tblviaturas:viaturaid(viaturamarca, viaturamodelo, viaturamatricula),
        tbltipoassistencia:tipoid(nome)
      `);
    if (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } else {
      setAgendamentos(data);
    }
  };

  const handleDelete = (id: number) => {
    setAgendamentoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async() => {
    if(!agendamentoToDelete) return;
    
    try {
      const {error} = await supabase.from("tblagendamentoservico")
        .delete().eq("id", agendamentoToDelete);

      if(error) return error;
      toast({ title: "Agendamento excluído", description: `O agendamento foi excluído com sucesso.` });
      fetchAgendamentos();
    } catch (error) {
      console.log("Erro ocorrido ao excluir agendamento de serviço. ",error);
      toast({ title: "Erro de exclusão", description: `Não foi possível excluir o agendamento, verifique a console.`});
    }finally{
      setShowDeleteDialog(false);
    }
  };

  const viewDetails = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "agendado":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Agendado</Badge>;
      case "em_atendimento":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Em atendimento</Badge>;
      case "cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
      case "concluido":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const abrirModal = (agendamento) => {
    if (agendamento) {
      setAgendamentoSelecionado(agendamento);
      setModalAberto(true);
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
        {temPermissao("agendamentos","caninsert") && (<Button onClick={() => navigate("/agendamentos/add")}> 
          <Plus className="mr-2 h-4 w-4" /> Novo Agendamento 
        </Button>)}
      </div>
      <hr/>
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <input type="text" placeholder="Pesquisar por matrícula da viatura" value={filtroMatricula}
          onChange={(e) => { setFiltroMatricula(e.target.value.toUpperCase());
            setCurrentPage(1); }}
          className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
        <Select value={filtroEstado} onValueChange={(value) => {
            setFiltroEstado(value); setCurrentPage(1); }}>
          <SelectTrigger className="w-[280px]">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar pelo Estado" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Estados</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <CardDescription>Agendamentos registrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
        <ScrollArea className="h-[350px]">
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
              {currentAgendamentos.map((agendamento) => (
                <TableRow key={agendamento.id}>
                  <TableCell>{agendamento.tblviaturas?.viaturamarca} {agendamento.tblviaturas?.viaturamodelo}</TableCell>
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
                        {temPermissao("agendamentos","canedit") && (<DropdownMenuItem onClick={() => abrirModal(agendamento)}>
                          <RefreshCw className="mr-2 h-4 w-4" /> Alterar Estado
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
              {agendamentoFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </ScrollArea>
          {/*Paginação*/}
          <Pagination
              totalItems={agendamentoFiltradas.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
          />
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
     
      {agendamentoSelecionado && (
        <EstadoServicoModal
          open={modalAberto}
          onClose={() => setModalAberto(false)}
          agendamento={agendamentoSelecionado}
          onSalvar={() => {
            // Você pode recarregar a lista aqui
            setModalAberto(false)
            setAgendamentoSelecionado(null)
            // Recarregar a lista, ex: fetchAgendamentos()
            fetchAgendamentos();
          }}
        />
      )}

    </div>
  );
};

export default AgendamentoList;
