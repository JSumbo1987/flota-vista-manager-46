import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, User2 } from "lucide-react";
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

// Mock de Funcionários
const funcionariosMock = [
  {
    funcionarioId: 1,
    funcionarioNome: "Carlos Manuel",
    numeroBI: "12345678LA045",
    nacionalidade: "Angolana",
    genero: "Masculino",
    provincia: "Luanda",
    funcionarioEmail: "carlos.manuel@email.com",
    funcionarioTelefone: "+244923456789",
    CartaDeConducaoNr: "CD123456",
    DataEmissao: "2023-01-01",
    DataValidade: "2025-01-01",
    estado: "activo",
  },
  {
    funcionarioId: 2,
    funcionarioNome: "Ana Silva",
    numeroBI: "98765432LB032",
    nacionalidade: "Angolana",
    genero: "Feminino",
    provincia: "Huíla",
    funcionarioEmail: "ana.silva@email.com",
    funcionarioTelefone: "+244912345678",
    CartaDeConducaoNr: "CD654321",
    DataEmissao: "2022-06-01",
    DataValidade: "2023-06-01",
    estado: "inactivo",
  },
];

interface Funcionario {
  funcionarioId: number;
  funcionarioNome: string;
  numeroBI: string;
  nacionalidade: string;
  genero: string;
  provincia: string;
  funcionarioEmail?: string;
  funcionarioTelefone: string;
  CartaDeConducaoNr?: string;
  DataEmissao?: string;
  DataValidade?: string;
  estado: string;
}

interface FuncionarioDetailsProps {
  funcionario: Funcionario | null;
  onClose: () => void;
}

const FuncionarioDetails = ({ funcionario, onClose }: FuncionarioDetailsProps) => {
  if (!funcionario) return null;

  const getStatusClass = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactivo":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Detalhes do Funcionário</DialogTitle>
        <DialogDescription>Informações detalhadas</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User2 className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className={`p-2 rounded text-center ${getStatusClass(funcionario.estado)}`}>
          <p className="text-sm font-medium capitalize">{funcionario.estado}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Nome</p>
            <p>{funcionario.funcionarioNome}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Nº BI</p>
            <p>{funcionario.numeroBI}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Telefone</p>
            <p>{funcionario.funcionarioTelefone}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{funcionario.funcionarioEmail || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Nacionalidade</p>
            <p>{funcionario.nacionalidade}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Província</p>
            <p>{funcionario.provincia}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Carta de Condução</p>
            <p>{funcionario.CartaDeConducaoNr || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Validade</p>
            <p>{funcionario.DataValidade || "N/A"}</p>
          </div>
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

const FuncionariosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = (id: number) => {
    setFuncionarioToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // TODO: Integração com Supabase
    toast({ title: "Funcionário excluído com sucesso." });
    setShowDeleteDialog(false);
  };

  const viewDetails = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (estado: string) => {
    const base = "text-xs px-2 py-1 rounded";
    if (estado === "activo") return <Badge variant="outline" className={`${base} bg-green-100 text-green-800`}>Ativo</Badge>;
    if (estado === "inactivo") return <Badge variant="outline" className={`${base} bg-red-100 text-red-800`}>Inativo</Badge>;
    return <Badge variant="outline">{estado}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Funcionários</h2>
          <p className="text-muted-foreground">Gestão de funcionários da organização</p>
        </div>
        <Button onClick={() => navigate("/funcionarios/add")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>Todos os funcionários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>BI</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionariosMock.map((f) => (
                <TableRow key={f.funcionarioId}>
                  <TableCell>{f.funcionarioNome}</TableCell>
                  <TableCell>{f.funcionarioTelefone}</TableCell>
                  <TableCell>{f.numeroBI}</TableCell>
                  <TableCell>{getStatusBadge(f.estado)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(f)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/funcionarios/edit/${f.funcionarioId}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(f.funcionarioId)}
                          className="text-destructive"
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
            <DialogTitle>Excluir Funcionário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este funcionário? Essa ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <FuncionarioDetails funcionario={selectedFuncionario} onClose={() => setShowDetailsDialog(false)} />
      </Dialog>
    </div>
  );
};

export default FuncionariosList;