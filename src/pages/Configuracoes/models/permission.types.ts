
export interface MenuPermission {
  id: string;
  name: string;
  canInsert: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}

export interface UserOrGroup {
  id: string;
  name: string;
}
