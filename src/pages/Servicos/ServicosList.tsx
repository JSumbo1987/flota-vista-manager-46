import { useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabaseClient";
import { usePermissao } from "@/hooks/usePermissao";
import Pagination from "@/components/paginacao/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";

// Tipos corrigidos para incluir os campos relacionados
interface Viatura {
  viaturamarca: string;
  viaturamatricula: string;
  viaturamodelo: string;
}

interface TipoAssistencia {
  nome: string;
}

interface CategoriaAssistencia {
  nome: string;
}

interface Prestador {
  prestadornome: string;
}

interface Servico {
  id: number;
  viaturaid: number;  // Ajustado para refletir que é uma chave de viatura
  tipoid: number;     // Ajustado para refletir que é uma chave de tipo
  categoriaid: number;  // Ajustado para refletir que é uma chave de categoria
  prestadorid: number;  // Ajustado para refletir que é uma chave de prestador
  tblviaturas: Viatura; // Relacionamento com viatura
  tbltipoassistencia: TipoAssistencia; // Relacionamento com tipo de assistência
  tblcategoriaassistencia: CategoriaAssistencia; // Relacionamento com categoria
  tblprestador: Prestador; // Relacionamento com prestador
  dataservico: string;
  custo: string;
  observacoes: string | null;
}

const ServicoDetails = ({
  servico,
  onClose,
}: {
  servico: Servico | null;
  onClose: () => void;
}) => {
  if (!servico) return null;
console.log(servico);
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
            <p className="text-sm font-medium">{servico.tblviaturas?.viaturamarca}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Matrícula</p>
            <p className="text-sm font-medium">{servico.tblviaturas?.viaturamatricula}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Categoria do Serviço</p>
            <p className="text-sm font-medium">{servico.tblcategoriaassistencia?.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
            <p className="text-sm font-medium">{servico.tbltipoassistencia?.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Prestador de Serviço</p>
            <p className="text-sm font-medium">{servico.tblprestador?.prestadornome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Custo ($)</p>
            <p className="text-sm font-medium">{parseFloat(servico.custo).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data do Serviço</p>
            <p className="text-sm font-medium">
              {new Date(servico.dataservico).toLocaleDateString("pt-PT")}
            </p>
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
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        {/* Você pode implementar editar aqui */}
      </DialogFooter>
    </DialogContent>
  );
};

const ServicosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<Servico | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { temPermissao } = usePermissao();
  const [filtroMatricula, setFiltroMatricula] = useState("");

  //Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const servicosFiltradas = servicos.filter((servico) =>
    servico.tblviaturas.viaturamatricula.toLowerCase().includes(filtroMatricula.toLowerCase()));
  const currentServicos = servicosFiltradas.slice(indexOfFirstItem, indexOfLastItem);  
//Fim paginação

  // Buscar dados do Supabase
  const fetchServicos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tblservicos")
      .select(`*,
        tblprestador:prestadorid(prestadornome),
        tbltipoassistencia:tipoid(nome),
        tblcategoriaassistencia:categoriaid(nome),
        tblviaturas:viaturaid(viaturamarca, viaturamodelo, viaturamatricula)`)
      .order("dataservico", { ascending: false });
      
    if (error) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setServicos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  // Exibir detalhes do serviço
  const viewDetails = (servico) => {
    setSelectedServico(servico);
    setShowDetailsDialog(true);
  };

  // Preparar para exclusão
  const handleDelete = (servico) => {
    setServicoToDelete(servico);
    setShowDeleteDialog(true);
  };

  // Confirmar exclusão
  const confirmDelete = async () => {
    if (!servicoToDelete) return;

    const { error } = await supabase
      .from("tblservicos")
      .delete()
      .eq("id", servicoToDelete.id);

    if (error) {
      toast({
        title: "Erro ao excluir serviço",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Serviço excluído",
        description: `O serviço foi excluído com sucesso.`,
      });
      // Atualizar lista
      fetchServicos();
    }

    setShowDeleteDialog(false);
    setServicoToDelete(null);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p>Carregando serviços...</p>
      </div>
    );
  }

  if (!temPermissao('servicos',"canview")) {
    return <p>Você não tem permissão para visualizar esta página.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground">
            Lista de serviços realizados nas viaturas
          </p>
        </div>
        {temPermissao('servicos','caninsert') && (<Button onClick={() => navigate("/servicos/add")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>)}
      </div>
      <hr/>
      <div className="mt-4">
        <input type="text" placeholder="Pesquisar por matrícula da viatura" value={filtroMatricula}
          onChange={(e) => setFiltroMatricula(e.target.value.toUpperCase())}
          className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={12}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>Serviços cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
        <ScrollArea className="h-[350px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Viatura</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prestador</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Custo ($)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                currentServicos.map((servico) => (
                  <TableRow key={servico.id}>
                    <TableCell>{servico.tblviaturas?.viaturamarca} {servico.tblviaturas?.viaturamodelo}</TableCell>
                    <TableCell>{servico.tblviaturas?.viaturamatricula}</TableCell>
                    <TableCell>{servico.tbltipoassistencia?.nome}</TableCell>
                    <TableCell>{servico.tblcategoriaassistencia?.nome}</TableCell>
                    <TableCell>{servico.tblprestador?.prestadornome}</TableCell>
                    <TableCell>{new Date(servico.dataservico).toLocaleDateString("pt-PT")}</TableCell>
                    <TableCell>{parseFloat(servico.custo).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {temPermissao('servicos','canview') && (<DropdownMenuItem onClick={() => viewDetails(servico)}>
                            <EyeIcon className="mr-2 h-4 w-4" />Ver detalhes</DropdownMenuItem>)}
                          {temPermissao('servicos','candelete') && (<DropdownMenuItem onClick={() => handleDelete(servico)}
                            className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </ScrollArea>
          {/*Paginação*/}
          <Pagination
              totalItems={servicosFiltradas.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Dialog de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Deseja realmente excluir este serviço? Esta ação é irreversível.
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

      {/* Dialog de detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <ServicoDetails
          servico={selectedServico}
          onClose={() => setShowDetailsDialog(false)}
        />
      </Dialog>
    </div>
  );
};

export default ServicosList;

