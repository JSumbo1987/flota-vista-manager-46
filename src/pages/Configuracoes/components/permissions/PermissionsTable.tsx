
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { MenuPermission } from "../../models/permission.types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

interface PermissionsTableProps {
  menuPermissions: MenuPermission[];
  onPermissionChange: (menuId: string, permission: 'canInsert' | 'canEdit' | 'canDelete' | 'canView', value: boolean) => void;
}

const PermissionsTable = ({ menuPermissions, onPermissionChange }: PermissionsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Menu</TableHead>
            <TableHead className="text-center w-24">
              <div className="flex items-center justify-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Inserir</span>
              </div>
            </TableHead>
            <TableHead className="text-center w-24">
              <div className="flex items-center justify-center gap-1">
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </div>
            </TableHead>
            <TableHead className="text-center w-24">
              <div className="flex items-center justify-center gap-1">
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </div>
            </TableHead>
            <TableHead className="text-center w-24">
              <div className="flex items-center justify-center gap-1">
                <Eye className="h-4 w-4" />
                <span>Visualizar</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuPermissions.map(menu => (
            <TableRow key={menu.id}>
              <TableCell className="font-medium">{menu.name}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={menu.canInsert}
                    onCheckedChange={(value) => onPermissionChange(menu.id, 'canInsert', value)}
                    disabled={menu.id === "dashboard" || menu.id === "notificacoes" || menu.id === "configuracoes"}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={menu.canEdit}
                    onCheckedChange={(value) => onPermissionChange(menu.id, 'canEdit', value)}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={menu.canDelete}
                    onCheckedChange={(value) => onPermissionChange(menu.id, 'canDelete', value)}
                    disabled={menu.id === "dashboard" || menu.id === "configuracoes"}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={menu.canView}
                    onCheckedChange={(value) => onPermissionChange(menu.id, 'canView', value)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionsTable;
