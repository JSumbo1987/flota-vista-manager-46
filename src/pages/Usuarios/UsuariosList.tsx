import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Edit, Trash, Plus, ChevronDown, Key } from "lucide-react";
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

const UsuariosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showChangePassDialog, setShowChangePassDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Buscar usuários
  useEffect(() => {
    const fetchUsuarios = async () => {
      const { data, error } = await supabase
        .from("tblusuarios")
        .select(`*, 
            tbltipousuarios:tipousuarioid(tipoid,descricaotipo,parametro_edit_config),
            tblgrupousuarios:grupousuarioid(grupoid,gruponame,descricao)`);
        
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
      } else {
        setUsuarios(data);
      }
    };
    fetchUsuarios();
  }, [toast]);

  // Função para abrir modal detalhes
  const viewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  // Função para abrir modal alterar senha
  const openChangePass = (user) => {
    setSelectedUser(user);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowChangePassDialog(true);
  };

  // Confirmar alteração de senha (simulação, pois a senha está criptografada no banco)
  const confirmChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Aqui você deve implementar a lógica real de alteração de senha, por exemplo, via RPC no Supabase
      // Exemplo fictício:
      const { error } = await supabase.rpc("alterar_senha_usuario", {
        p_userid: selectedUser.userid,
        p_old_password: oldPassword,
        p_new_password: newPassword,
      });
      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Senha atualizada com sucesso.",
      });
      setShowChangePassDialog(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha.",
        variant: "destructive",
      });
    }
  };

  // Resetar senha (gera senha aleatória e envia e-mail - simulação)
  const resetPassword = async (user) => {
    try {
      // Simulação de reset
      const { error } = await supabase.rpc("resetar_senha_usuario", {
        p_userid: user.userid,
      });
      if (error) throw error;

      toast({
        title: "Senha resetada",
        description: `Senha do usuário ${user.usernome} resetada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao resetar senha.",
        variant: "destructive",
      });
    }
  };

  // Confirmar exclusão do usuário
  const handleDelete = (userid) => {
    setUserToDelete(userid);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from("tblusuarios")
        .delete()
        .eq("userid", userToDelete);

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });

      setUsuarios((prev) => prev.filter((u) => u.userid !== userToDelete));
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário.",
        variant: "destructive",
      });
    }
  };

  // Badge para estado
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "activo":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        );
      case "inactivo":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Inativo
          </Badge>
        );
      default:
        return <Badge variant="outline">{estado || "Desconhecido"}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerenciamento dos usuários do sistema
          </p>
        </div>
        <Button onClick={() => navigate("/usuarios/add")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Usuários cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo Usuário</TableHead>
                <TableHead>Grupo Usuário</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((user) => (
                <TableRow key={user.userid}>
                  <TableCell className="font-medium">{user.usernome}</TableCell>
                  <TableCell>{user.useremail}</TableCell>
                  <TableCell>{user.tbltipousuarios?.descricaotipo}</TableCell>
                  <TableCell>{user.tblgrupousuarios?.gruponame}</TableCell>
                  <TableCell>{getEstadoBadge(user.estado)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(user)}>
                          <EyeIcon className="mr-2 h-4 w-4" /> Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openChangePass(user)}>
                          <Key className="mr-2 h-4 w-4" /> Alterar senha
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => resetPassword(user)}
                        >
                          <Key className="mr-2 h-4 w-4" /> Resetar senha
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/usuarios/edit/${user.userid}`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/usuarios/permissions/${user.userid}`)
                          }
                        >
                          <Badge className="mr-2">Permissões</Badge> Definir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(user.userid)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Excluir
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

      {/* Modal Detalhes Usuário */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        {selectedUser && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Informações detalhadas do usuário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-lg font-medium">{selectedUser.usernome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{selectedUser.useremail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Usuário</p>
                <p className="text-lg font-medium">{selectedUser.tipousuarioid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grupo de Usuário</p>
                <p className="text-lg font-medium">{selectedUser.grupousuarioid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email Confirmado</p>
                <p className="text-lg font-medium">
                  {selectedUser.useremailconfirmed ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Login Rápido</p>
                <p className="text-lg font-medium">
                  {selectedUser.isfastlogin ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                {getEstadoBadge(selectedUser.estado)}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Modal Alterar Senha */}
      <Dialog open={showChangePassDialog} onOpenChange={setShowChangePassDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Informe a senha antiga e a nova senha para o usuário{" "}
              <strong>{selectedUser?.usernome}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-muted-foreground"
              >
                Senha Antiga
              </label>
              <input
                id="oldPassword"
                type="password"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-muted-foreground"
              >
                Nova Senha
              </label>
              <input
                id="newPassword"
                type="password"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-muted-foreground"
              >
                Confirmar Nova Senha
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePassDialog(false)}>
              Cancelar
            </Button>
            <Button variant="default" onClick={confirmChangePassword}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser
              desfeita.
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
    </div>
  );
};

export default UsuariosList;
