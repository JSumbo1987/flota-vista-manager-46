
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, AlertTriangle, CheckCircle, XCircle, Car, Users, CalendarDays, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon } from "lucide-react";

// Ensure consistent status types
type TaskStatus = "warning" | "Pendente" | "Concluido" | "Cancelado";

const StatCard = ({
  icon: Icon,
  title,
  value,
  description,
  onClick
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description?: string;
  onClick?: () => void;
}) => (
  <Card className={onClick ? "cursor-pointer transition-all hover:shadow-md" : ""} onClick={onClick}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const UpcomingItem = ({
  title,
  description,
  date,
  status
}: {
  title: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "canceled" | "warning";
}) => {
  const getStatusClass = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className={`p-3 border-l-4 mb-2 ${getStatusClass()}`}>
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-xs">{date}</span>
      </div>
      <p className="text-xs mt-1">{description}</p>
    </div>
  );
};

const LicenseAlert = ({
  vehicle,
  license,
  expiresIn
}: {
  vehicle: string;
  license: string;
  expiresIn: number;
}) => (
  <div className="flex items-center gap-3 p-3 border rounded-md bg-yellow-50 border-yellow-200 mb-2">
    <AlertTriangle className="h-5 w-5 text-yellow-500" />
    <div>
      <p className="text-sm font-medium">{vehicle}</p>
      <p className="text-xs text-muted-foreground">
        Licença nrº {license}  expira em {expiresIn} {expiresIn === 1 ? "dia" : "dias"}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // States
  const [totalViaturas, setTotalViaturas] = useState(0);
  const [totalViaturasAtribuidas, setTotalViaturasAtribuidas] = useState(0);
  const [funcionarios, setFuncionarios] = useState(0);
  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState(0);
  const [agendamentosPendentes, setAgendamentosPendentes] = useState<number>(0);
  const [agendamentosHoje, setAgendamentosHoje] = useState<number>(0);
  const [licencasVencer, setLicencasVencer] = useState<number>(0);
  const [licencasPublicidadeVencer, setLicencasPublicidadeVencer] = useState<number>(0);
  const [licencasAlertList, setLicencasAlertList] = useState<
    { vehicle: string; license: string; expiresIn: number }[]
  >([]);
  const [licencasPublicidadeAlertList, setLicencasPublicidadeAlertList] = useState<
    { vehicle: string; license: string; expiresIn: number }[]
  >([]);
  const [proximosAgendamentos, setProximosAgendamentos] = useState<
    { id: string; title: string; description: string; date: string; status: "pending" | "completed" | "canceled" | "warning" }[]
  >([]);
  const [ultimosServicos, setUltimosServicos] = useState<
    { id: string; title: string; description: string; date: string; status: "pending" | "completed" | "canceled" | "warning" }[]
  >([]);

  useEffect(() => {
    async function fetchStats() {
      // Total de Viaturas
      const { count: viaturasCount, error: viaturasError } = await supabase
        .from("tblviaturas")
        .select("*", { count: "exact", head: true });
      if (!viaturasError) setTotalViaturas(viaturasCount || 0);

      //Total de Viaturas Atribuidas
      const { data, error } = await supabase.from("tblfuncionarioviatura").select("viaturaid", { count: "exact" });
      if (!error) { setTotalViaturasAtribuidas(data.length); }
      
      // Buscar funcionários e motoristas disponíveis
      const { data: funcionariosData, error: funcionariosError } = await supabase
      .from("tblfuncionarios")
      .select("funcionarioid, funcaotipoid, estado");

      if (funcionariosError) {
      console.error("Erro ao buscar funcionários:", funcionariosError);
      } else if (funcionariosData) {
      setFuncionarios(funcionariosData.length);

      // Filtrar motoristas disponíveis (funcaotipoid contém "motorista" e estado é "Activo")
      const motoristasDisponiveisCount = funcionariosData.filter(f =>
        typeof f.funcaotipoid === "string" &&
        f.funcaotipoid.toLowerCase().includes("motorista") &&
        f.estado?.toLowerCase() === "activo"
      ).length;

      setMotoristasDisponiveis(motoristasDisponiveisCount);
      }


      // Buscar agendamentos pendentes e contagem dos que são para hoje
      const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const { data: agendamentosData, error: agendamentosError } = await supabase
        .from("tblagendamentoservico")
        .select(`
          *,
          tbltipoassistencia:tipoid(id,nome),
          tblviaturas:viaturaid(viaturaid,viaturamarca, viaturamodelo,viaturamatricula)
        `)
        .eq("status", "Pendente");

      if (agendamentosError) {
        console.error("Erro ao buscar agendamentos:", agendamentosError);
      } else if (agendamentosData) {
        setAgendamentosPendentes(agendamentosData.length);

        // Contar agendamentos para hoje (dataagendada começa com yyyy-mm-dd)
        const agendamentosHojeCount = agendamentosData.filter(a =>
          a.dataagendada?.startsWith(hoje)
        ).length;
        setAgendamentosHoje(agendamentosHojeCount);

        // Mapear os 5 próximos agendamentos para exibição
        const proximos = agendamentosData.slice(0, 5).map(a => ({
          id: a.id,
          title: a.tbltipoassistencia.nome || "Agendamento",
          description: a.tblviaturas.viaturamarca+" "+a.tblviaturas.viaturamodelo+" - "+a.tblviaturas?.viaturamatricula || "", // ajuste para usar dados da relação
          date: new Date(a.dataagendada).toLocaleDateString("pt-BR"),
          status: "pending" as const
        }));

        setProximosAgendamentos(proximos);
      }


      // Buscar licenças a vencer (exemplo para tbllicencatransportacao)
      const hojes = new Date();
      const trintaDiasDepois = new Date();
      trintaDiasDepois.setDate(hojes.getDate() + 30);

      const { data: licencasData, error: licencasError } = await supabase
        .from("tbllicencatransportacao")
        .select("*")
        .gte("datavencimento", hojes.toISOString().slice(0, 10))
        .lte("datavencimento", trintaDiasDepois.toISOString().slice(0, 10))
        .order("datavencimento", { ascending: true });

      if (licencasError) {
        console.error("Erro ao buscar licenças a vencer:", licencasError);
      } else if (licencasData) {
        setLicencasVencer(licencasData.length);

        const alertas = licencasData.map(licenca => {
          const diasParaVencer = Math.ceil(
            (new Date(licenca.datavencimento).getTime() - hojes.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            vehicle: licenca.veiculo,
            license: licenca.tipo_licenca,
            expiresIn: diasParaVencer,
          };
        });

        setLicencasAlertList(alertas);
      };

      // Buscar licenças de publicidade a vencer
      const hojeP = new Date();
      const dataLimite = new Date();
      dataLimite.setDate(hojeP.getDate() + 30);

      try {
        const { data: licencasData, error: licencasError } = await supabase
          .from("tbllicencapublicidade")
          .select(`*, tblviaturas:viaturaid(viaturaid, viaturamarca, viaturamodelo, viaturamatricula)`)
          .gte("datavencimento", hojeP.toISOString().slice(0, 10))
          .lte("datavencimento", dataLimite.toISOString().slice(0, 10))
          .order("datavencimento", { ascending: true });

        if (licencasError) {
          console.error("Erro ao buscar licenças de publicidade a vencer:", licencasError);
          return;
        }

        if (licencasData) {
          setLicencasPublicidadeVencer(licencasData.length);

          const alertas = licencasData.map(licenca => {
            const diasParaVencer = Math.ceil(
              (new Date(licenca.datavencimento).getTime() - hojeP.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return {
              vehicle: licenca.tblviaturas.viaturamarca+" "+licenca.tblviaturas.viaturamodelo+" - "+licenca.tblviaturas.viaturamatricula,
              license: licenca.licencanumero,
              expiresIn: diasParaVencer,
            };
          });

          setLicencasPublicidadeAlertList(alertas);
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar licenças:", error);
      };

      // Buscar últimos serviços realizados
      try {
        const { data: servicosData, error: servicosError } = await supabase
          .from("tblservicos") // Agora usando tblservicos
          .select(`*,
            tbltipoassistencia:tipoid(id, nome),
            tblviaturas:viaturaid(viaturaid, viaturamarca, viaturamodelo, viaturamatricula)`)
          .order("dataservico", { ascending: false }) // Corrigido: assumindo que o campo é dataservico
          .limit(5);

        if (servicosError) {
          console.error("Erro ao buscar últimos serviços realizados:", servicosError);
          return;
        }

        if (servicosData) {
          const ultimosServicos = servicosData.map(servico => ({
            id: servico.id,
            title: servico.tblviaturas.viaturamarca+" "+servico.tblviaturas.viaturamodelo+" - "+servico.tblviaturas.viaturamatricula+
            ` # Serviço: ${servico.tbltipoassistencia?.nome}`, // Alterado para o contexto de serviços
            description: servico.observacoes || "", // Assumindo que há um campo descricao
            date: new Date(servico.dataservico).toLocaleDateString(), // Assumindo dataservico
            status: servico.status as "pending" | "completed" | "canceled" | "warning",
          }));

          setUltimosServicos(ultimosServicos);
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar serviços:", error);
      }
    }//fim

    fetchStats();
  }, []);

  const [custos, setCustos] = useState({ manutencao: 0, reparos: 0, combustivel: 0});
  function formatViaturasAtribuidas(count: number) {
    return count === 1 ? "1 viatura atribuída" : `${count} viaturas atribuídas`;
  }
  function formatMotoristarDisponiveis(count: number){
    return count === 1 ? "1 motorista disponível" : `${count} motoristas disponíveis`;
  }

  useEffect(() => {
    const fetchCustos = async () => {
      const hoje = new Date();
      
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      .toISOString().slice(0, 10); // yyyy-MM-dd

      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      .toISOString().slice(0, 10); 
  
      try {
        // Serviços de Manutenção e Reparos
        const { data: servicosData } = await supabase
          .from("tblservicos")
          .select(`*, tblcategoriaassistencia:categoriaid(id, nome)`)
          .gte("dataservico", primeiroDiaMes)
          .lte("dataservico", ultimoDiaMes);
  
        let manutencao = 0;
        let reparos = 0;

        if (servicosData) {
          servicosData.forEach((s) => {
            if (s.tblcategoriaassistencia?.nome.toLowerCase().includes("preventiva")) {
              manutencao += Number(s.custo || 0);
            } else {
              reparos += Number(s.custo || 0);
            }
          });
        }
  
        // Custos com Combustível
        const { data: combustivelData } = await supabase
          .from("tblabastecimentos")
          .select("valortotal")
          .gte("dataabastecimento", primeiroDiaMes)
          .lte("dataabastecimento", ultimoDiaMes);
  
        const combustivel = combustivelData?.reduce((acc, curr) => acc + (curr.valortotal || 0), 0) || 0;
  
        // Atualizar o estado
        setCustos({
          manutencao,
          reparos,
          combustivel,
        });
  
      } catch (error) {
        console.error("Erro ao buscar custos:", error);
      }
    };
  
    fetchCustos();
  }, []);
  
  const total = custos.manutencao + custos.reparos + custos.combustivel;
  
  const calcularPercentual = (valor: number) => {
    if (total === 0) return 0;
    return (valor / total) * 100;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral da gestão de viaturas e serviços.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Car}
              title="Total de Viaturas"
              value={totalViaturas.toString()}
              description={formatViaturasAtribuidas(totalViaturasAtribuidas)}
              onClick={() => navigate("/viaturas")}
            />
            <StatCard
              icon={Users}
              title="Funcionários"
              value={funcionarios.toString()}
              description={formatMotoristarDisponiveis(motoristasDisponiveis)}
              onClick={() => navigate("/funcionarios")}
            />
            <StatCard
              icon={CalendarIcon}
              title="Agendamentos Pendentes"
              value={agendamentosPendentes.toString()}
              description={`${agendamentosHoje} para hoje`}
              onClick={() => navigate("/agendamentos")}
            />
            <StatCard
              icon={AlertTriangle}
              title="Licenças Transporte a Vencer"
              value={licencasVencer.toString()}
              description="Próximos 30 dias"
              onClick={() => navigate("/licenca-transporte")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Custos Mensais de Serviços</CardTitle>
                <CardDescription>Análise de custos de manutenção e serviços</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Manutenção Preventiva */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Manutenção Preventiva</div>
                      <div className="text-sm font-medium">
                        {custos.manutencao.toLocaleString("pt-BR", { style: "currency", currency: "AOA" })}
                      </div>
                    </div>
                    <Progress value={calcularPercentual(custos.manutencao)} className="h-2" />
                  </div>
                  {/* Reparos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Reparos</div>
                      <div className="text-sm font-medium">
                        {custos.reparos.toLocaleString("pt-BR", { style: "currency", currency: "AOA" })}
                      </div>
                    </div>
                    <Progress value={calcularPercentual(custos.reparos)} className="h-2" />
                  </div>
                  {/* Combustível */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Combustível</div>
                      <div className="text-sm font-medium">
                        {custos.combustivel.toLocaleString("pt-BR", { style: "currency", currency: "AOA" })}
                      </div>
                    </div>
                    <Progress value={calcularPercentual(custos.combustivel)} className="h-2" />
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Licenças Publicidade a Vencer</CardTitle>
                <CardDescription>Próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {licencasPublicidadeAlertList.length === 0 && (
                    <p className="text-muted-foreground">Nenhuma licença próxima do vencimento.</p>
                  )}
                  {licencasPublicidadeAlertList.map(({ vehicle, license, expiresIn }, idx) => (
                    <LicenseAlert key={idx} vehicle={vehicle} license={license} expiresIn={expiresIn} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Agendamentos</CardTitle>
                <CardDescription>Agendamentos para os próximos dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {proximosAgendamentos.length === 0 && (
                    <p className="text-muted-foreground">Nenhum agendamento pendente.</p>
                  )}
                  {proximosAgendamentos.map(({ id, title, description, date, status }) => (
                    <UpcomingItem key={id} title={title} description={description} date={date} status={status} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Serviços</CardTitle>
                <CardDescription>Serviços realizados recentemente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ultimosServicos.length === 0 && <p className="text-muted-foreground">Nenhum serviço registrado.</p>}
                  {ultimosServicos.map(({ id, title, description, date, status }) => (
                    <UpcomingItem key={id} title={title} description={description} date={date} status={status} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="p-4 text-center text-muted-foreground">Análises detalhadas ainda não implementadas.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
