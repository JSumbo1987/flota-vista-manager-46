
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MenuPermission } from "../models/permission.types";
import PermissionSelector from "./permissions/PermissionSelector";
import PermissionsTable from "./permissions/PermissionsTable";

const PermissionsTab = () => {
  const { toast } = useToast();
  const [selectedPermissionType, setSelectedPermissionType] = useState<"users" | "groups">("users");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Menu permissions state
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([
    { id: "dashboard", nomeMenu: "Dashboard", canInsert: false, canEdit: false, canDelete: false, canView: true, canTodos: false, canurl:'/' },
    { id: "viaturas", nomeMenu: "Viaturas", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/viaturas' },
    { id: "funcionarios", nomeMenu: "Funcionários", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/funcionarios'},
    { id: "agendamentos", nomeMenu: "Agendamentos", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/agendamentos' },
    { id: "servicos", nomeMenu: "Serviços", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/servicos' },
    { id: "checklist", nomeMenu: "Checklist", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/checklist' },
    { id: "certificados", nomeMenu: "Certificados", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/certificados' },
    { id: "licenca-transporte", nomeMenu: "Licença Transporte", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/licenca-transporte' },
    { id: "licenca-publicidade", nomeMenu: "Licença Publicidade", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/licenca-publicidade' },
    { id: "usuarios", nomeMenu: "Usuários", canInsert: true, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/usuarios' },
    { id: "notificacoes", nomeMenu: "Notificações", canInsert: false, canEdit: true, canDelete: true, canView: true, canTodos: false, canurl:'/notificacoes' },
    { id: "configuracoes", nomeMenu: "Configurações", canInsert: false, canEdit: true, canDelete: false, canView: true, canTodos: false, canurl:'/configuracoes' },
  ]);

  const handlePermissionChange = (menuId: string, permission: 'canInsert' | 'canEdit' | 'canDelete' | 'canView', value: boolean) => {
    setMenuPermissions(prev => 
      prev.map(menu => 
        menu.id === menuId 
          ? { ...menu, [permission]: value }
          : menu
      )
    );
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações de permissões no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Permissões salvas",
        description: `As permissões para ${selectedPermissionType === 'users' ? 'o usuário' : 'o grupo'} foram atualizadas com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as permissões.",
        variant: "destructive"
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
