
export interface MenuPermission {
  id: string;
  nomemenu: string;
  canInsert: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  canTodos: boolean;
  canurl: string;
}

export interface UserOrGroup {
  id: string;
  name: string;
}
