
// Type definitions for license-related components

interface LicencaTransporte {
  id: string;
  viaturaid: string;
  descricao: string;
  observacao?: string;
  proprietario: string;
  dataemissao: string;
  datavencimento: string;
  copialicencatransporte: string;
  licencastatus: string;
  licencanumero: string;
  custodalicenca?: number;
  tblviaturas?: {
    viaturamarca: string;
    viaturamodelo: string;
    viaturamatricula: string;
  };
}

interface LicencaPublicidade {
  id: string;
  viaturaid: string;
  descricao: string;
  observacao?: string;
  proprietario: string;
  dataemissao: string;
  datavencimento: string;
  copialicencapublicidade: string;
  licencastatus: string;
  licencanumero: string;
  custodalicenca?: number;
  tblviaturas?: {
    viaturamarca: string;
    viaturamodelo: string;
    viaturamatricula: string;
  };
}
