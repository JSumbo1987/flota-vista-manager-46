import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface Checklist {
  id: number;
  viatura: string;
  motorista: string;
  odometro: number;
  nivelcombustivel: string;
  condicaopneus: string;
  observacao: string;
  datachecklist: string;
  status: string;
  tblviaturas?: {
    viaturamarca: string;
    viaturamatricula: string;
  };
  tblfuncionarios?: {
    funcionarionome: string;
  };
}

interface ChecklistItem {
  id: number;
  checklistid: number;
  descricao: string;
  status: string;
}

//Details Checklist
const ChecklistDetails = ({
  checklist,
  onClose,
}: {
  checklist: Checklist | null;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checklist) return;

    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tblchecklistitem")
        .select("*")
        .eq("checklistid", checklist.id);

      if (error) {
        toast({ title: "Erro ao carregar itens", description: error.message });
      } else {
        setItems(data || []);
      }
      setLoading(false);
    };

    fetchItems();
  }, [checklist, toast]);

  if (!checklist) return null;

  return (
    <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
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
            <p className="text-sm font-medium">
              {checklist.tblviaturas?.viaturamarca} ({checklist.tblviaturas?.viaturamatricula})
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Motorista</p>
            <p className="text-sm font-medium">{checklist.tblfuncionarios?.funcionarionome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Odômetro</p>
            <p className="text-sm font-medium">{checklist.odometro.toLocaleString()} km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Combustível</p>
            <p className="text-sm font-medium">{checklist.nivelcombustivel}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pneus</p>
            <p className="text-sm font-medium">{checklist.condicaopneus}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm font-medium">{checklist.status}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Data</p>
            <p className="text-sm font-medium">
              {new Date(checklist.datachecklist).toLocaleDateString("pt-PT")}
            </p>
          </div>
        </div>
        {checklist.observacao && (
          <div>
            <p className="text-sm text-muted-foreground">Observações</p>
            <p className="text-sm font-medium">{checklist.observacao}</p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-2">Itens do Checklist</h3>
          {loading ? (
            <p>Carregando itens...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ChecklistsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<number | null>(null);

  const fetchChecklists = async () => {
    const { data, error } = await supabase
      .from("tblchecklist")
      .select(
        `*,
        tblfuncionarios:motoristaid(funcionarionome),
        tblviaturas:viaturaid(viaturamarca, viaturamatricula)`
      );

    if (error) {
      toast({ title: "Erro", description: error.message });
    } else {
      setChecklists(data || []);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const handleDelete = (id: number) => {
    setChecklistToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (checklistToDelete === null) return;

    const { error } = await supabase.from("tblchecklist").delete().eq("id", checklistToDelete);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message });
    } else {
      toast({ title: "Checklist excluído", description: `Checklist removido com sucesso.` });
      setChecklists((prev) => prev.filter((c) => c.id !== checklistToDelete)); // atualiza local
      setChecklistToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const viewDetails = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (estado: string) => {
    const base = "text-xs px-2 py-1 rounded";
    switch (estado.toLowerCase()) {
      case "aprovado":
        return (
          <Badge variant="outline" className={`${base} bg-green-100 text-green-800`}>
            Aprovado
          </Badge>
        );
      case "reprovado":
        return (
          <Badge variant="outline" className={`${base} bg-red-100 text-red-800`}>
            Reprovado
          </Badge>
        );
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Checklists</h2>
          <p className="text-muted-foreground">Listagem de checklists de viaturas</p>
        </div>
        <Button onClick={() => navigate("/checklist/add")}>
          {" "}
          <Plus className="mr-2 h-4 w-4" /> Novo Checklist{" "}
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
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checklists.map((checklist) => (
                <TableRow key={checklist.id}>
                  <TableCell>
                    {checklist.tblviaturas?.viaturamarca} ({checklist.tblviaturas?.viaturamatricula})
                  </TableCell>
                  <TableCell>{checklist.tblfuncionarios?.funcionarionome}</TableCell>
                  <TableCell>{new Date(checklist.datachecklist).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>{checklist.odometro.toLocaleString()} km</TableCell>
                  <TableCell>{checklist.nivelcombustivel}</TableCell>
                  <TableCell>{getStatusBadge(checklist.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/checklist/viewDetails/${checklist.id}`)}>
                          <EyeIcon className="mr-2 h-4 w-4" /> Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/checklist/edit/${checklist.id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(checklist.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {checklists.length === 0 && (
                <TableRow>
                <TableCell colSpan={8} className="text-center">
                    Nenhum checklist encontrado.
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
            <DialogDescription>
              Tem certeza que deseja excluir este checklist? Essa ação não poderá ser desfeita.
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

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        {selectedChecklist && (
          <ChecklistDetails
            checklist={selectedChecklist}
            onClose={() => setShowDetailsDialog(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default ChecklistsList;

