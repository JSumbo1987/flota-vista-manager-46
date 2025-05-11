import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader,CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { ChevronDown, EyeIcon, Edit, Trash, Car, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { usePermissao } from "@/hooks/usePermissao";
import Pagination from "@/components/paginacao/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";

const ListaViaturasAtribuidas = () => {
  const { temPermissao } = usePermissao();  
  const [viaturasAtribuidas, setViaturasAtribuidas] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [atribuicaoToDelete, setAtribuicaoToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  //Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentViaturasAtribuidas = viaturasAtribuidas.slice(indexOfFirstItem, indexOfLastItem);
  //Fim paginação

  useEffect(() => {
    fetchViaturasAtribuidas();
  }, []);

  const fetchViaturasAtribuidas = async () => {
    const { data, error } = await supabase
      .from("tblfuncionarioviatura")
      .select(`*,
        tblviaturas:viaturaid (
          viaturaid,
          viaturamatricula,
          viaturamarca,
          viaturamodelo,
          viaturacor,
          viaturaanofabrica,
          tblviaturatipo ( viaturatipo ),
          tblviaturacategoria ( viaturacategoria )
        ),
        tblfuncionarios:funcionarioid (
          funcionarioid,
          funcionarionome
        )
      `);

    if (error) {
      console.error("Erro ao buscar viaturas atribuídas:", error);
      return;
    }

    setViaturasAtribuidas(data);
  };

  const handleDelete = (viaturaid: number) => {
    setAtribuicaoToDelete(viaturaid);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (atribuicaoToDelete === null) return;

    const { error } = await supabase.from("tblfuncionarioviatura").delete().eq("viaturaid", atribuicaoToDelete);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message });
    } else {
      toast({ title: "Atribuição excluída", description: `Atribuição removido com sucesso.` });
      fetchViaturasAtribuidas();
      setViaturasAtribuidas((prev) => prev.filter((c) => c.id !== atribuicaoToDelete)); // atualiza local
      setAtribuicaoToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
     <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight"></h2>
          <p className="text-muted-foreground"></p>
        </div>
        <Button onClick={() => navigate("/viaturas")}>{" "}
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar{" "}</Button>
    </div><br/>

    <Card>
      <CardHeader>
        <CardTitle>Viaturas Atribuídas</CardTitle>
        <CardDescription>
          Lista de viaturas já atribuídas a funcionários
        </CardDescription>
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
              <TableHead>Funcionário</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentViaturasAtribuidas.map((item) => (
              <TableRow key={item.tblviaturas?.viaturaid}>
                <TableCell>
                  {item.tblviaturas?.viaturamarca}{" "}
                  {item.tblviaturas?.viaturamodelo}
                </TableCell>
                <TableCell>{item.tblviaturas?.viaturamatricula}</TableCell>
                <TableCell>
                  {item.tblviaturas?.tblviaturatipo?.viaturatipo}
                </TableCell>
                <TableCell>
                  {item.tblviaturas?.tblviaturacategoria?.viaturacategoria}
                </TableCell>
                <TableCell>{item.tblviaturas?.viaturacor}</TableCell>
                <TableCell>{item.tblviaturas?.viaturaanofabrica}</TableCell>
                <TableCell>{item.tblfuncionarios?.funcionarionome}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {temPermissao("viaturas","candelete") && (<DropdownMenuItem onClick={() => handleDelete(item.tblviaturas?.viaturaid)}
                        className="text-destructive focus:text-destructive">
                        <Trash className="mr-2 h-4 w-4" />Remover</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {viaturasAtribuidas.length === 0 && (
                <TableRow>
                <TableCell colSpan={8} className="text-center">
                    Nenhuma atribuição encontrado.
                </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        </ScrollArea>
        {/*Paginação*/}
        <Pagination
            totalItems={viaturasAtribuidas.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
        />
      </CardContent>
    </Card>

    {/* Confirmar Delete */}
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta atrinuição? Essa ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListaViaturasAtribuidas;

