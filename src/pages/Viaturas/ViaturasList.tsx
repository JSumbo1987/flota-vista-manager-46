import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, Car, Fuel, FolderCheck } from "lucide-react";
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
import { Filter } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../Auth/AuthContext";
import { usePermissao } from "@/hooks/usePermissao";
import Pagination from "@/components/paginacao/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";

const ViaturaDetails = ({viatura, onClose }: { viatura: any; onClose: () => void; }) => {
  if (!viatura) return null;
  
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Detalhes da Viatura</DialogTitle>
        <DialogDescription>Informações completas da viatura</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Car className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Matrícula", viatura.viaturamatricula],
            ["Marca", viatura.viaturamarca],
            ["Modelo", viatura.viaturamodelo],
            ["Tipo", viatura.tblviaturatipo.viaturatipo],
            ["Categoria", viatura.tblviaturacategoria.viaturacategoria],
            ["Ano", viatura.viaturaanofabrica],
            ["Cor", viatura.viaturacor],
            ["Combustível", viatura.viaturacombustivel],
            ["Quilometragem", `${parseFloat(viatura.quilometragem).toLocaleString()} km`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ViaturasList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viaturas, setViaturas] = useState<any[]>([]);
  const [selectedViatura, setSelectedViatura] = useState<any | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viaturaToDelete, setViaturaToDelete] = useState<number | null>(null);
  const [filtroMatricula, setFiltroMatricula] = useState("");
  const { temPermissao } = usePermissao();  
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [tipos, setTipos] = useState([]);


  //Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [viaturaSelecionado, setViaturaSelecionado] = useState(null);
  const viaturasFiltradas = viaturas.filter((viatura) => {
    const temMatricula = filtroMatricula.trim() !== "";
    const temCategoria = filtroCategoria !== "";
    const temTipo = filtroTipo !== "";
  
    if (temMatricula) {
      return viatura.viaturamatricula
        .toLowerCase()
        .includes(filtroMatricula.toLowerCase());
    }
    
    const correspondeCategoria = !temCategoria || viatura.viaturacategoriaid === parseInt(filtroCategoria);
    const correspondeTipo = !temTipo || viatura.viaturatipoid === parseInt(filtroTipo);
  
    return correspondeCategoria && correspondeTipo;
  });
  
  
  const currentViaturas = viaturasFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  //Fim paginação

  useEffect(() => {
    const fetchViaturas = async () => {
      const { data, error } = await supabase.from("tblviaturas")
        .select(`*, 
          tblviaturacategoria:viaturacategoriaid(viaturacategoria),
          tblviaturatipo:viaturatipoid(viaturatipo)`);
      if (error) {
        toast({
          title: "Erro ao carregar viaturas",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setViaturas(data);
      }
    };

    fetchViaturas();
  }, [toast]);

  useEffect(() => {
    const fetchCategoriasETipos = async () => {
      const [{ data: categoriasData }, { data: tiposData }] = await Promise.all([
        supabase.from("tblviaturacategoria").select("id, viaturacategoria"),
        supabase.from("tblviaturatipo").select("id, viaturatipo")
      ]);
      setCategorias(categoriasData || []);
      setTipos(tiposData || []);
    };
  
    fetchCategoriasETipos();
  }, []);  

  const handleDeleteClick = (viatura) =>{
    setViaturaSelecionado(viatura);
    setShowDeleteDialog(true);
  };

  const handleDelete = async() => {
    if(!viaturaSelecionado) return

    try{
      const { error } = await supabase.from("tblviaturas").delete().eq("viaturaid", viaturaSelecionado.viaturaid);
      if(error){
        toast({
          title: "Erro ao excluir viatura.",
          description: error.message,
          variant: "destructive",
        });
        return;
      };

      toast({
        title: "Viatura excluído",
        description: `A Viatura foi excluída com sucesso.`,
      });
      
      setViaturas((prev) => prev.filter((v) => v.viaturaid !== viaturaSelecionado.viaturaid));
    }catch(error){
      console.error("Erro ao excluir viatura:", error);
      toast({ title:"Erro ao Excluir", description: "Erro ao excluir a viatura, verifique a console.", variant: "destructive" });
    }finally{
      setViaturaSelecionado(null);
      setShowDeleteDialog(false);
    }
  };

  const viewDetails = (viatura) => {
    setSelectedViatura(viatura);
    setShowDetailsDialog(true);
  };

  if (!temPermissao('viaturas',"canview")) {
    return <p>Você não tem permissão para visualizar esta página.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Viaturas</h2>
          <p className="text-muted-foreground">Lista de viaturas cadastradas</p>
        </div>
        <div className="flex gap-2">
          {temPermissao("viaturas","canview") && (<Button variant="outline" onClick={() => navigate("/viaturas/viaturasatribuidas")}>
            <Car className="mr-2 h-4 w-4" /> Listar Viatura Atribuidas
          </Button>)}
          <Button variant="destructive" onClick={() => navigate("/viaturas/abastecer/add")}>
            <Fuel className="mr-2 h-4 w-4" /> Novo Abastecimento
          </Button>
          {temPermissao('viaturas',"caninsert") && (<Button onClick={() => navigate("/viaturas/add")}>
            <Plus className="mr-2 h-4 w-4" /> Nova Viatura
          </Button>)}
        </div>
      </div>
      <hr/>
      <div className="mt-4 flex flex-col md:flex-row gap-2">
        <input type="text" placeholder="Pesquisar por matrícula da viatura" value={filtroMatricula}
          onChange={(e) => setFiltroMatricula(e.target.value.toUpperCase())}
          className="w-full md:w-1/3 px-4 py-2 border rounded-md"/>

          <Select value={filtroCategoria} onValueChange={(value) => {
            setFiltroCategoria(value === "todos" ? "" : value);  setCurrentPage(1);
          }}>
          <SelectTrigger className="w-full md:w-1/4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por Categoria" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.viaturacategoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroTipo} onValueChange={(value) => {
            setFiltroTipo(value === "todos" ? "" : value); setCurrentPage(1); }}>
          <SelectTrigger className="w-full md:w-1/4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por Tipo" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            {tipos.map((tipo) => (
              <SelectItem key={tipo.id} value={String(tipo.id)}>
                {tipo.viaturatipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Viaturas</CardTitle>
          <CardDescription>Viaturas registradas no sistema</CardDescription>
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
                <TableHead>Cor</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentViaturas.map((viatura) => (
                <TableRow key={viatura.viaturaid}>
                  <TableCell>{viatura.viaturamarca} {viatura.viaturamodelo}</TableCell>
                  <TableCell>{viatura.viaturamatricula}</TableCell>
                  <TableCell>{viatura.tblviaturatipo.viaturatipo}</TableCell>
                  <TableCell>{viatura.tblviaturacategoria.viaturacategoria}</TableCell>
                  <TableCell>{viatura.viaturacor}</TableCell>
                  <TableCell>{viatura.viaturaanofabrica}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {temPermissao("viaturas","canview") && (<DropdownMenuItem onClick={() => viewDetails(viatura)}>
                          <EyeIcon className="mr-2 h-4 w-4" />Ver detalhes</DropdownMenuItem>)}
                        {temPermissao("viaturas","canedit") && (<DropdownMenuItem onClick={() => navigate(`/viaturas/edit/${viatura.viaturaid}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>)}
                        {temPermissao("viaturas","candelete") && (<DropdownMenuItem
                          onClick={() => handleDeleteClick(viatura)}
                          className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>)}
                        {temPermissao("viaturas","canview") && (<DropdownMenuItem onClick={() => navigate(`/viaturas/abastecer/detalhe/${viatura.viaturaid}`)}>
                          <Fuel className="mr-2 h-4 w-4" />Detalhe Abastecimento</DropdownMenuItem>)}
                        {temPermissao("viaturas","canview") && (<DropdownMenuItem onClick={() => navigate(`/viaturas/documentos/${viatura.viaturaid}`)}>
                          <FolderCheck className="mr-2 h-4 w-4" />Documentos</DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {viaturas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Nenhuma viatura encontrado.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
          </ScrollArea>
          {/*Paginação*/}
          <Pagination
              totalItems={viaturasFiltradas.length}
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
            <DialogDescription>
              Deseja realmente excluir esta viatura? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <ViaturaDetails viatura={selectedViatura} onClose={() => setShowDetailsDialog(false)} />
      </Dialog>
    </div>
  );
};

export default ViaturasList;

