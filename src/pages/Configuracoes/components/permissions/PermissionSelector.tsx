
import { useState, useEffect } from "react";
import { User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { UserOrGroup } from "../../models/permission.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PermissionSelectorProps {
  selectedPermissionType: "users" | "groups";
  setSelectedPermissionType: (type: "users" | "groups") => void;
  selectedUser: string;
  setSelectedUser: (id: string) => void;
  selectedGroup: string;
  setSelectedGroup: (id: string) => void;
}

const PermissionSelector = ({
  selectedPermissionType,
  setSelectedPermissionType,
  selectedUser,
  setSelectedUser,
  selectedGroup,
  setSelectedGroup
}: PermissionSelectorProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOrGroup[]>([]);
  const [groups, setGroups] = useState<UserOrGroup[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('tblusuarios')
        .select('userid, usernome')
        .order('usernome');
      
      if (error) throw error;
      
      setUsers(data.map(user => ({
        id: user.userid,
        name: user.usernome
      })));
      
      if (data.length > 0 && !selectedUser) {
        setSelectedUser(data[0].userid);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive"
      });
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('tblgrupousuarios')
        .select('grupoid, gruponame')
        .order('gruponame');
      
      if (error) throw error;
      
      setGroups(data.map(group => ({
        id: group.grupoid,
        name: group.gruponame
      })));
      
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0].grupoid);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de grupos",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button 
          variant={selectedPermissionType === "users" ? "default" : "outline"} 
          onClick={() => setSelectedPermissionType("users")}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          <span>Usuários</span>
        </Button>
        <Button 
          variant={selectedPermissionType === "groups" ? "default" : "outline"} 
          onClick={() => setSelectedPermissionType("groups")}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          <span>Grupos de Usuários</span>
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-or-group">
          {selectedPermissionType === "users" ? "Usuário" : "Grupo de Usuários"}
        </Label>
        
        {selectedPermissionType === "users" ? (
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger id="user-select">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger id="group-select">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(group => (
                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default PermissionSelector;
