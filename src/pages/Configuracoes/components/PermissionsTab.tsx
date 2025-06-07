import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MenuPermission } from "../models/permission.types";
import PermissionSelector from "./permissions/PermissionSelector";
import PermissionsTable from "./permissions/PermissionsTable";
import { useSalvarPermissoes } from "@/hooks/useSalvarPermissoes";
import { useListarPermissoes } from "@/hooks/useListarPermissoes";

const MENU_BASE: MenuPermission[] = [
  { id: "dashboard", nomemenu: "Dashboard", canInsert: false, canEdit: false, canDelete: false, canView: true, canTodos: false, canurl: "/" },
  { id: "viaturas", nomemenu: "Viaturas", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/viaturas" },
  { id: "funcionarios", nomemenu: "Funcionários", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/funcionarios" },
  { id: "agendamentos", nomemenu: "Agendamentos", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/agendamentos" },
  { id: "servicos", nomemenu: "Serviços", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/servicos" },
  { id: "checklist", nomemenu: "Checklist", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/checklist" },
  { id: "certificados", nomemenu: "Certificados", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/certificados" },
  { id: "licenca-transporte", nomemenu: "Licença Transporte", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/licenca-transporte" },
  { id: "licenca-publicidade", nomemenu: "Licença Publicidade", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/licenca-publicidade" },
  { id: "usuarios", nomemenu: "Usuários", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/usuarios" },
  { id: "notificacoes", nomemenu: "Notificações", canInsert: false, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl: "/notificacoes" },
  { id: "configuracoes", nomemenu: "Configurações", canInsert: false, canEdit: true, canDelete: false, canView: true, canTodos: false, canurl: "/configuracoes" },
];

const PermissionsTab = () => {
  const { toast } = useToast();
  const [selectedPermissionType, setSelectedPermissionType] = useState<"users" | "groups">("users");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const { salvarPermissoes } = useSalvarPermissoes();
  const { listarPermissoes } = useListarPermissoes();

  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>(MENU_BASE);

  // Buscar permissões quando um grupo é selecionado
  useEffect(() => {
    const fetchPermissoes = async () => {
      if (selectedPermissionType !== "groups" || !selectedGroup) return;
    
      try {
        const permissoesSalvas = await listarPermissoes(selectedGroup);
    
        const merged = MENU_BASE.map(menu => {
          const found = permissoesSalvas.find(p => p.id === menu.id);
          return {
            id: menu.id,
            nome: menu.nomemenu,
            canView: found?.canView ?? false,
            canInsert: found?.canInsert ?? false,
            canEdit: found?.canEdit ?? false,
            canDelete: found?.canDelete ?? false,
            canTodos: found?.canTodos ?? false,
          };
        });
    
        setMenuPermissions(merged);
      } catch (error) {
        toast({
          title: "Erro ao carregar permissões",
          description: "Verifique sua conexão ou tente novamente.",
          variant: "destructive",
        });
      }
    };
    

    fetchPermissoes();
  }, [selectedGroup, selectedPermissionType, toast]);

  const handlePermissionChange = (
    menuId: string,
    permission: "canInsert" | "canEdit" | "canDelete" | "canView" | "canTodos",
    value: boolean
  ) => {
    setMenuPermissions(prev =>
      prev.map(menu =>
        menu.id === menuId ? { ...menu, [permission]: value } : menu
      )
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedGroup) {
      toast({
        title: "Grupo não selecionado",
        description: "Selecione um grupo para salvar as permissões.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await salvarPermissoes(selectedGroup, menuPermissions);
      toast({
        title: "Permissões salvas",
        description: "As permissões foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as permissões.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PermissionSelector
        selectedPermissionType={selectedPermissionType}
        setSelectedPermissionType={setSelectedPermissionType}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />

      <Separator className="my-6" />

      <PermissionsTable
        menuPermissions={menuPermissions}
        onPermissionChange={handlePermissionChange}
      />

      <Button
        onClick={handleSavePermissions}
        className="mt-4 w-full sm:w-auto"
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar Permissões"}
      </Button>
    </div>
  );
};

export default PermissionsTab;

