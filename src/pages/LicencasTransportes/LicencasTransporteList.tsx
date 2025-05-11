import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, BadgePercent, Filter } from "lucide-react";
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

const LicencaTransporteList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [licencas, setLicencas] = useState([]);
  const [selectedLicenca, setSelectedLicenca] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [licencaToDelete, setLicencaToDelete] = useState(null);
  const { temPermissao } = usePermissao(); 
  const [filtroMatricula, setFiltroMatricula] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos"); // 'todos', 'vencidos', 'avencer'

  //Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const licencasFiltradas = licencas.filter((licenca) =>{
    const matchMatriculaOuNumero = 
      licenca.viaturamatricula.toLowerCase().includes(filtroMatricula.toLowerCase()) ||
      licenca.numerolicenca.toLowerCase().includes(filtroMatricula.toLowerCase());
    const matchStatus = statusFilter === "todos" || licenca.licencastatus === statusFilter;

    return matchMatriculaOuNumero && matchStatus;
  });
  const currentLicencas = licencasFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  //Fim paginação

  useEffect(() => {
    const fetchLicencas = async () => {
      const { data, error } = await supabase
        .from("tbllicencatransportacao")
        .select(`*,
          tblviaturas:viaturaid ( viaturaid, viaturamarca, viaturamodelo, viaturamatricula )
        `);

      if (error) {
        console.error("Erro ao buscar licenças de transporte:", error);
      } else {
        const licencasFormatadas = await Promise.all(
          data.map(async (item) => {
            let signedUrl = null;

            if (item.copialicencatransporte) {
              const { data: urlData, error: urlError } = await supabase.storage
                .from("documentos")
                .createSignedUrl(item.copialicencatransporte, 60);

              if (urlError) {
                console.error("Erro ao gerar URL assinada:", urlError);
              } else {
                signedUrl = urlData?.signedUrl || null;
              }
            }

            return {
              id: item.id,
              numerolicenca: item.licencanumero,
              descricao: item.descricao,
              observacao: item.observacao,
              proprietario: item.proprietario,
              dataemissao: item.dataemissao,
              datavencimento: item.datavencimento,
              licencastatus: item.licencastatus,
              signedUrl,
              viatura: item.tblviaturas
                ? `${item.tblviaturas.viaturamarca} ${item.tblviaturas.viaturamodelo}`
                : "N/A",
              viaturamatricula:item.tblviaturas.viaturamatricula,
            };
          })
        );

        setLicencas(licencasFormatadas);
      }
    };

    fetchLicencas();
  }, []);

  const handleDelete = (id) => {
    setLicencaToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!licencaToDelete) {
      toast({
        title: "Erro",
        description: "ID da licença não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: licenca, error: fetchError } = await supabase
        .from("tbllicencatransportacao")
        .select("copialicencatransporte")
        .eq("id", licencaToDelete)
        .single();

      if (fetchError) throw fetchError;

      const caminhoArquivo = licenca?.copialicencatransporte;

      const { error: deleteError } = await supabase
        .from("tbllicencatransportacao")
        .delete()
        .eq("id", licencaToDelete);

      if (deleteError) throw deleteError;

      if (caminhoArquivo) {
        const { error: storageError } = await supabase.storage
          .from("documentos")
          .remove([caminhoArquivo]);

        if (storageError) {
          console.error("Erro ao deletar do storage:", storageError.message);
        }
      }

      toast({
        title: "Licença de transporte excluída",
        description: "A licença foi excluída com sucesso.",
      });

      setShowDeleteDialog(false);
      setLicencaToDelete(null);
      setLicencas((prev) => prev.filter((licenca) => licenca.id !== licencaToDelete));
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Erro desconhecido.",
        variant: "destructive",
      });
    }
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
      case "vencido":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Vencido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!temPermissao('licenca-transporte',"canview")) {
    return <p>Você não tem permissão para visualizar esta página.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Licenças de Transporte</h2>
          <p className="text-muted-foreground">
            Gerenciamento das licenças de transporte das viaturas
          </p>
        </div>
        {temPermissao("licenca-transporte","caninsert") && (<Button onClick={() => navigate("/licencas-transporte/add")}>
          <Plus className="mr-2 h-4 w-4" /> Nova Licença
        </Button>)}
      </div>
      <hr/>
      <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
        <input type="text" placeholder="Pesquisar por matrícula ou número da licença" value={filtroMatricula}
          onChange={(e) => setFiltroMatricula(e.target.value.toUpperCase())}
          className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="vencido">Vencidos</SelectItem>
              <SelectItem value="a_vencer">A vencer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Licenças de Transporte</CardTitle>
          <CardDescription>
            Licenças de transporte registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
        <ScrollArea className="h-[350px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Viatura</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Data de Validade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLicencas.map((licenca) => (
                <TableRow key={licenca.id}>
                  <TableCell className="font-medium">{licenca.numerolicenca}</TableCell>
                  <TableCell className="font-medium">{licenca.proprietario}</TableCell>
                  <TableCell>{licenca.viatura}</TableCell>
                  <TableCell>{licenca.viaturamatricula}</TableCell>
                  <TableCell>{new Date(licenca.datavencimento).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>{getStatusBadge(licenca.licencastatus)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {temPermissao("licenca-transporte","canview") && (<DropdownMenuItem onClick={() => viewDetails(licenca)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>)}
                        {temPermissao("licenca-transporte","canedit") && (<DropdownMenuItem onClick={() => navigate(`/licencas-transporte/edit/${licenca.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>)}
                        {temPermissao("licenca-transporte","candelete") && (<DropdownMenuItem onClick={() => handleDelete(licenca.id)} className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {licencasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhuma licença de transporte encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </ScrollArea>
          {/*Paginação*/}
          <Pagination
              totalItems={licencasFiltradas.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação de Exclusão */}
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

      {/* Diálogo de Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        {selectedLicenca && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes da Licença</DialogTitle>
              <DialogDescription>Informações detalhadas da licença de transporte</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BadgePercent className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className={`p-2 rounded ${selectedLicenca.licencastatus === "válido" ? "bg-green-100 text-green-800 border-green-200" : selectedLicenca.licencastatus === "a_vencer" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                <p className="text-sm font-medium text-center capitalize">{selectedLicenca.licencastatus.replace("_", " ")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Proprietário</p>
                  <p className="text-sm font-medium">{selectedLicenca.proprietario}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Viatura</p>
                  <p className="text-sm font-medium">{selectedLicenca.viatura}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Emissão</p>
                  <p className="text-sm font-medium">{new Date(selectedLicenca.dataemissao).toLocaleDateString("pt-PT")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Validade</p>
                  <p className="text-sm font-medium">{new Date(selectedLicenca.datavencimento).toLocaleDateString("pt-PT")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="text-sm font-medium">{selectedLicenca.descricao}</p>
                </div>
                {selectedLicenca.signedUrl && (
                  <div className="col-span-2 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Documento Anexado:</p>
                    <a
                      href={selectedLicenca.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Visualizar documento em anexo
                    </a>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default LicencaTransporteList;
