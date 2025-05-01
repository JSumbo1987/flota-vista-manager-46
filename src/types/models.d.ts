// Common type definitions to fix TypeScript errors

// Certificado type
interface Certificado {
  id: string;
  viaturaid: string;
  numerocertificado: string;
  centroinspeccao: string;
  datahorainspeccao: string;
  proximainspeccao: string;
  observacoes?: string;
  certificadostatus: string;
  copiacertificado: string;
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
  };
  tblcategoriaassistencia: {
    descricao: string;
  };
}

// TipoUsuario type
interface TipoUsuario {
  id: string;
  tipoid: string;
  descricao: string;
  descricaotipo: string;
}

// GrupoUsuario type
interface GrupoUsuario {
  id: string;
  grupoid: string;
  gruponame: string;
}

// Usuario type
interface Usuario {
  id: string;
  usernome?: string;
  useremail?: string;
  // Other user properties
}

// PerfilUsuarioData type
interface PerfilUsuarioData {
  userid?: string;
  usernome?: string;
  useremail?: string;
  tbltipousuarios: {
    descricaotipo: string;
  };
  tblgrupousuarios: {
    gruponame: string;
  };
  tblusuariofuncionario: {
    tblfuncionarios: {
      funcionarionome: string;
      funcionarioemail: string;
      funcaotipoid: string;
      categoriaid: string;
      fotografia: string;
    };
  }[];
}

// Dashboard task statuses
type TaskStatus = "warning" | "Pendente" | "Concluido" | "Cancelado";
