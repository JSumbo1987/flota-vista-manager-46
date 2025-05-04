
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, User2, Car } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePermissao } from "@/hooks/usePermissao";

interface Funcionario {
  funcionarioid: number;
  funcionarionome: string;
  numerobi: string;
  nacionalidade: string;
  genero: string;
  provincia: string;
  funcionarioemail?: string;
  funcionariotelefone: string;
  cartadeconducaonr?: string;
  dataemissao?: string;
  datavalidade?: string;
  funcaotipoid?: string;
  categoriaid?: string;
  estado: string;
}

interface FuncionarioDetailsProps {
  funcionario: Funcionario | null;
  onClose: () => void;
}

const FuncionarioDetails = ({ funcionario, onClose }: FuncionarioDetailsProps) => {
  if (!funcionario) return null;

  const {
    funcionarionome,
    numerobi,
    funcionariotelefone,
    funcionarioemail,
    nacionalidade,
    provincia,
    cartadeconducaonr,
    datavalidade,
    estado,
  } = funcionario;

  const getStatusClass = (estado: string) => {
    switch (estado.toLowerCase()) {
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
        <div className={`p-2 rounded text-center ${getStatusClass(estado)}`}>
          <p className="text-sm font-medium capitalize">{estado}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Nome</p>
            <p>{funcionarionome}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Nº BI</p>
            <p>{numerobi}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Telefone</p>
            <p>{funcionariotelefone}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{funcionarioemail || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Nacionalidade</p>
            <p>{nacionalidade}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Província</p>
            <p>{provincia}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Carta de Condução</p>
            <p>{cartadeconducaonr || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Validade</p>
            <p>{datavalidade || "N/A"}</p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const FuncionariosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const { temPermissao } = usePermissao(); 

  useEffect(() => {
    const fetchFuncionarios = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tblfuncionarios")
        .select("*");
      if (error) {
        toast({
          title: "Erro ao carregar registros de funcionários",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setFuncionarios(data || []);
      }
      setLoading(false);
    };

    fetchFuncionarios();
  }, [toast]);

  const handleDelete = (id: number) => {
    setFuncionarioToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteFuncionario = async () => {
    if (!funcionarioToDelete) return;
  
    try {
      let possuiRelacoes = false;
  
      // 1. Verificar se existe registro em tblusuariofuncionario
      const { data: usuarioFuncionario, error: errorUsuarioFuncionario } = await supabase
        .from("tblusuariofuncionario")
        .select("userid")
        .eq("funcionarioid", funcionarioToDelete)
        .single();
  
      if (errorUsuarioFuncionario && errorUsuarioFuncionario.code !== "PGRST116") {
        throw new Error(errorUsuarioFuncionario.message);
      }
  
      // 2. Verificar se existe registro em tblchecklist (motoristaid)
      const { data: checklists, error: errorChecklists } = await supabase
        .from("tblchecklist")
        .select("id")
        .eq("motoristaid", funcionarioToDelete);
  
      if (errorChecklists) {
        throw new Error(errorChecklists.message);
      }
  
      // 3. Verificar se existe registro em tblfuncionarioviatura
      const { data: funcionarioViaturas, error: errorFuncViatura } = await supabase
        .from("tblfuncionarioviatura")
        .select("funcionarioid")
        .eq("funcionarioid", funcionarioToDelete);
  
      if (errorFuncViatura) {
        throw new Error(errorFuncViatura.message);
      }
  
      // Se existir em qualquer uma das tabelas, sinaliza que tem relações
      possuiRelacoes =
        !!usuarioFuncionario || 
        (checklists && checklists.length > 0) || 
        (funcionarioViaturas && funcionarioViaturas.length > 0);
  
  
      // Excluir o funcionário
      const { error: errorDeleteFuncionario } = await supabase
        .from("tblfuncionarios")
        .delete()
        .eq("funcionarioid", funcionarioToDelete);
  
      if (errorDeleteFuncionario) {
        throw new Error(errorDeleteFuncionario.message);
      }
  
      // Atualizar UI
      setFuncionarios((prev) => prev.filter((f) => f.funcionarioid !== funcionarioToDelete));
  
      toast({
        title: "Funcionário excluído",
        description: "Funcionário e registros relacionados foram removidos com sucesso.",
      });
    } catch (err) {
      console.log(err);
      toast({
        title: "Erro ao excluir funcionário",
        description: err.message || "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const viewDetails = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (estado: string) => {
    const base = "text-xs px-2 py-1 rounded";
    switch (estado.toLowerCase()) {
      case "activo":
        return (
          <Badge variant="outline" className={`${base} bg-green-100 text-green-800`}>
            Activo
          </Badge>
        );
      case "inactivo":
        return (
          <Badge variant="outline" className={`${base} bg-red-100 text-red-800`}>
            Inactivo
          </Badge>
        );
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (!temPermissao('funcionarios',"canview")) {
    return <p>Você não tem permissão para visualizar esta página.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <p className="text-muted-foreground">Lista de funcionários cadastradas</p>
        </div>
        {temPermissao("funcionarios","caninsert") && (<Button onClick={() => navigate("/funcionarios/add")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
        </Button>)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>Todos os funcionários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando funcionários...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Nacionalidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Província</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.map((f) => (
                  <TableRow key={f.funcionarioid}>
                    <TableCell>{f.funcionarionome}</TableCell>
                    <TableCell>{f.nacionalidade}</TableCell>
                    <TableCell>{f.funcionariotelefone}</TableCell>
                    <TableCell>{f.provincia}</TableCell>
                    <TableCell>{f.funcaotipoid || "-"}</TableCell>
                    <TableCell>{f.categoriaid || "-"}</TableCell>
                    <TableCell>{getStatusBadge(f.estado)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {temPermissao("funcionarios","canview") && (<DropdownMenuItem onClick={() => viewDetails(f)}>
                            <EyeIcon className="mr-2 h-4 w-4" />Ver detalhes</DropdownMenuItem>)}
                          {temPermissao("funcionarios","canview") && (<DropdownMenuItem onClick={() => navigate(`/funcionarios/documentos/${f.funcionarioid}`)}>
                            <EyeIcon className="mr-2 h-4 w-4" />Ver arquivos</DropdownMenuItem>)}
                          {temPermissao("funcionarios","canedit") && (<DropdownMenuItem onClick={() => navigate(`/funcionarios/edit/${f.funcionarioid}`)}>
                            <Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>)}
                          {temPermissao("funcionarios","caninsert") && (<DropdownMenuItem onClick={() => navigate(`/funcionarios/criar-conta/${f.funcionarioid}`)}>
                            <User2 className="mr-2 h-4 w-4" />Criar conta</DropdownMenuItem>)}
                          {temPermissao("funcionarios","caninsert") && (<DropdownMenuItem onClick={() => navigate(`/funcionarios/atribuirviatura/${f.funcionarioid}`)}>
                            <Car className="mr-2 h-4 w-4" />Atribuir Viatura</DropdownMenuItem>)}
                          {temPermissao("funcionarios","candelete") && (<DropdownMenuItem onClick={() => handleDelete(f.funcionarioid)}
                           className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {funcionarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Nenhum funcionário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <FuncionarioDetails
          funcionario={selectedFuncionario}
          onClose={() => setShowDetailsDialog(false)}
        />
      </Dialog>

      {/* Dialog Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFuncionario}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FuncionariosList;
