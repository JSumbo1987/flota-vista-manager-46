// Common type definitions to fix TypeScript errors

// Certificado type
interface Certificado {
  id: string;
  viaturaid: string;
  numerocertificado: string;
  centroinspeccao: string;
  datahorainspeccao: string;
  proximainspeccao: string;
  numerodoquadro?: string;
  quilometragem?: string;
  observacoes?: string;
  certificadostatus?: string;
  status?: string;
  copiadocertificado?: string;
  copiacertificado?: string;
  tblviaturas: {
    viaturaid: string;
    viaturamarca: string;
    viaturamodelo: string;
    viaturamatricula: string;
  };
  custodocertificado?: number;
}

// Servico type
interface Servico {
  id: string;
  viaturaid: string;
  tipoassistenciaid: string;
  categoriaassistenciaid: string;
  prestador: string;
  datainicio: string;
  horainicio: string;
  datafim?: string;
  horafim?: string;
  custo?: number;
  observacoes?: string;
  servicostatus: string;
  copiafatura?: string;
  tblviaturas: {
    viaturamarca: string;
    viaturamodelo: string;
    viaturamatricula: string;
  };
  tbltipoassistencia: {
    descricao: string;
    nome?: string;
  };
  tblcategoriaassistencia: {
    descricao: string;
    nome?: string;
  };
  tblprestador: {
    prestadornome: string;
  };
}

// TipoUsuario type
interface TipoUsuario {
  tipousuarioid: string;
  descricao: string;
}

// GrupoUsuario type
interface GrupoUsuario {
  grupousuarioid: string;
  nome: string;
}

// Usuario type
interface Usuario {
  id: string;
  userid: string;
  usernome?: string;
  useremail?: string;
  issuperusuario?: boolean;
  useremailconfirmed?: boolean;
  isfastlogin?: number;
  estado?: string;
  funcionarioid?: string;
  // Other user properties
}

// PerfilUsuarioData type
interface PerfilUsuarioData {
  userid?: string;
  usernome?: string;
  useremail?: string;
  tbltipousuarios?: {
    descricaotipo: string;
  };
  tblgrupousuarios?: {
    gruponame: string;
  };
  tblusuariofuncionario?: {
    tblfuncionarios?: {
      funcionarionome: string;
      funcionarioemail: string;
      funcaotipoid: string;
      categoriaid: string;
      fotografia?: string | null;
    };
  };
}

// UserDetails type for UserDetailsModal
interface UserDetails {
  userid: string;
  usernome: string;
  useremail: string;
  estado: string;
  issuperusuario: boolean;
  isfastlogin: number;
  useremailconfirmed: boolean;
  tbltipousuarios: {
    descricao: string;
  };
  tblgrupousuarios: {
    nome: string;
  };
  tblusuariofuncionario: {
    tblfuncionarios?: {
      funcionarionome: string;
      funcionarioemail: string;
      funcaotipoid: string;
      categoriaid: string;
      fotografia?: string | null;
    };
  };
}

// Dashboard task statuses
type TaskStatus = "warning" | "Pendente" | "Concluido" | "Cancelado";

// Notification type
interface Notification {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "warning" | "error" | "info" | "success";
  lido: boolean;
  rota: string;
  created_at: string;
}
