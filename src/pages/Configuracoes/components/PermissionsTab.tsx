
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
    { id: "dashboard", name: "Dashboard", canInsert: false, canEdit: false, canDelete: false, canView: true },
    { id: "viaturas", name: "Viaturas", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "funcionarios", name: "Funcionários", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "agendamentos", name: "Agendamentos", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "servicos", name: "Serviços", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "checklist", name: "Checklist", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "certificados", name: "Certificados", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "licenca-transporte", name: "Licença Transporte", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "licenca-publicidade", name: "Licença Publicidade", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "usuarios", name: "Usuários", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "notificacoes", name: "Notificações", canInsert: false, canEdit: true, canDelete: true, canView: true },
    { id: "configuracoes", name: "Configurações", canInsert: false, canEdit: true, canDelete: false, canView: true },
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
