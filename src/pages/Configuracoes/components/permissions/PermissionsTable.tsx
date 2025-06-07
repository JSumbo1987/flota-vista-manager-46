
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuPermission } from "@/pages/Configuracoes/models/permission.types";


interface PermissionsTableProps {
  menuPermissions: MenuPermission[];
  onPermissionChange: (menuId: string, permission: 'canInsert' | 'canEdit' | 'canDelete' | 'canView' | 'canTodos', value: boolean) => void;
}

const PermissionsTable = ({ menuPermissions, onPermissionChange }: PermissionsTableProps) => {

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Nome do Menu</TableHead>
            <TableHead className="text-center w-[100px]">Visualizar</TableHead>
            <TableHead className="text-center w-[100px]">Inserir</TableHead>
            <TableHead className="text-center w-[100px]">Editar</TableHead>
            <TableHead className="text-center w-[100px]">Excluir</TableHead>
            <TableHead className="text-center w-[100px]">Todos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuPermissions.map((menu) => (
            <TableRow key={menu.id}>
              <TableCell className="font-medium">{menu.nome}</TableCell>
              
              <TableCell className="text-center">
                <Checkbox
                  id={`view-${menu.id}`}
                  checked={menu.canView}
                  onCheckedChange={(checked) => 
                    onPermissionChange(menu.id, 'canView', !!checked)
                  }
                  aria-label={`Permissão para visualizar ${menu.nome}`}
                />
              </TableCell>
              
              <TableCell className="text-center">
                <Checkbox
                  id={`insert-${menu.id}`}
                  checked={menu.canInsert}
                  onCheckedChange={(checked) => 
                    onPermissionChange(menu.id, 'canInsert', !!checked)
                  }
                  aria-label={`Permissão para inserir em ${menu.nome}`}
                />
              </TableCell>
              
              <TableCell className="text-center">
                <Checkbox
                  id={`edit-${menu.id}`}
                  checked={menu.canEdit}
                  onCheckedChange={(checked) => 
                    onPermissionChange(menu.id, 'canEdit', !!checked)
                  }
                  aria-label={`Permissão para editar ${menu.nome}`}
                />
              </TableCell>
              
              <TableCell className="text-center">
                <Checkbox
                  id={`delete-${menu.id}`}
                  checked={menu.canDelete}
                  onCheckedChange={(checked) => 
                    onPermissionChange(menu.id, 'canDelete', !!checked)
                  }
                  aria-label={`Permissão para excluir ${menu.nome}`}
                />
              </TableCell>
              
              <TableCell className="text-center">
                <Checkbox
                  id={`todos-${menu.id}`}
                  checked={menu.canTodos}
                  onCheckedChange={(checked) => 
                    onPermissionChange(menu.id, 'canTodos', !!checked)
                  }
                  aria-label={`Permissão para Todos ${menu.nome}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionsTable;
