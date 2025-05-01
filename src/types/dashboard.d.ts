
// Dashboard types
interface DashboardStats {
  totalViaturas: number;
  viaturasAtivas: number;
  totalFuncionarios: number;
  funcionariosAtivos: number;
  proximosAgendamentos: number;
  servicosEmAndamento: number;
  proximasManutencoes: number;
  certificadosAVencer: number;
  licencasAVencer: number;
}

interface StatusMap {
  [key: string]: "warning" | "Pendente" | "Concluido" | "Cancelado";
}

interface StatusIcon {
  [key: string]: React.ReactNode;
}

interface DashboardProps {
  // Add any props if needed
}
