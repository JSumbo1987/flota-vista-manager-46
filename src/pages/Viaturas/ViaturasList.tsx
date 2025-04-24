import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, Car } from "lucide-react";
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

const ViaturaDetails = ({
  viatura,
  onClose,
}: {
  viatura: any;
  onClose: () => void;
}) => {
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
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={() => {}}>Editar</Button>
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

  const handleDelete = async(id: number) => {
    
    const { error } = await supabase.from("tblviaturas").delete().eq("viaturaid", id);
    if(error){
      toast({
        title: "Erro ao excluir viatura.",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setViaturaToDelete(id);
    setShowDeleteDialog(true);
    setViaturas((prev) => prev.filter((v) => v.viaturaid !== id));
  };

  const confirmDelete = () => {
    toast({
      title: "Viatura excluída",
      description: `A viatura foi excluída com sucesso.`,
    });
    setShowDeleteDialog(false);
  };

  const viewDetails = (viatura: any) => {
    setSelectedViatura(viatura);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Viaturas</h2>
          <p className="text-muted-foreground">Lista de viaturas cadastradas</p>
        </div>
        <Button onClick={() => navigate("/viaturas/add")}>
          <Plus className="mr-2 h-4 w-4" /> Nova Viatura
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Viaturas</CardTitle>
          <CardDescription>Viaturas registradas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viaturas.map((viatura) => (
                <TableRow key={viatura.viaturaid}>
                  <TableCell>{viatura.viaturamatricula}</TableCell>
                  <TableCell>{viatura.viaturamarca}</TableCell>
                  <TableCell>{viatura.viaturamodelo}</TableCell>
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
                        <DropdownMenuItem onClick={() => viewDetails(viatura)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/viaturas/edit/${viatura.viaturaid}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(viatura.viaturaid)}
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
              Deseja realmente excluir esta viatura? Esta ação é irreversível.
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
        <ViaturaDetails viatura={selectedViatura} onClose={() => setShowDetailsDialog(false)} />
      </Dialog>
    </div>
  );
};

export default ViaturasList;

