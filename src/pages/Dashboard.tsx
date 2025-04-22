
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Car, Calendar, Users, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  status: "pending" | "completed" | "canceled" | "warning" 
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

const LicenseAlert = ({ vehicle, license, expiresIn }: { vehicle: string; license: string; expiresIn: number }) => (
  <div className="flex items-center gap-3 p-3 border rounded-md bg-yellow-50 border-yellow-200 mb-2">
    <AlertTriangle className="h-5 w-5 text-yellow-500" />
    <div>
      <p className="text-sm font-medium">{vehicle}</p>
      <p className="text-xs text-muted-foreground">
        {license} expira em {expiresIn} {expiresIn === 1 ? "dia" : "dias"}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral da gestão de viaturas e serviços.
        </p>
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
              value="24" 
              description="+2 este mês"
              onClick={() => navigate("/viaturas")}
            />
            <StatCard 
              icon={Users} 
              title="Funcionários" 
              value="142" 
              description="6 motoristas disponíveis"
              onClick={() => navigate("/funcionarios")}
            />
            <StatCard 
              icon={Calendar} 
              title="Agendamentos Pendentes" 
              value="8" 
              description="3 para hoje"
              onClick={() => navigate("/agendamentos")}
            />
            <StatCard 
              icon={AlertTriangle} 
              title="Licenças a Vencer" 
              value="5" 
              description="Próximos 30 dias"
              onClick={() => navigate("/licenca-transporte")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Custos Mensais de Serviços</CardTitle>
                <CardDescription>
                  Análise de custos de manutenção e serviços
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Manutenção Preventiva</div>
                      <div className="text-sm font-medium">$12,500</div>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Reparos</div>
                      <div className="text-sm font-medium">$8,320</div>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Combustível</div>
                      <div className="text-sm font-medium">$5,680</div>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Licenças e Documentação</div>
                      <div className="text-sm font-medium">$1,250</div>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Licenças a Vencer</CardTitle>
                <CardDescription>Próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <LicenseAlert 
                    vehicle="Toyota Hilux (ABC-1234)" 
                    license="Licença de Transporte" 
                    expiresIn={5} 
                  />
                  <LicenseAlert 
                    vehicle="Ford Ranger (XYZ-5678)" 
                    license="Certificado de Inspeção" 
                    expiresIn={8} 
                  />
                  <LicenseAlert 
                    vehicle="Mitsubishi L200 (DEF-9012)" 
                    license="Licença de Publicidade" 
                    expiresIn={12} 
                  />
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
                  <UpcomingItem
                    title="Troca de Óleo"
                    description="Toyota Hilux (ABC-1234) - Oficina Central"
                    date="Hoje, 14:00"
                    status="pending"
                  />
                  <UpcomingItem
                    title="Revisão dos 30.000 km"
                    description="Ford Ranger (XYZ-5678) - Concessionária Ford"
                    date="Amanhã, 09:30"
                    status="pending"
                  />
                  <UpcomingItem
                    title="Inspeção Semestral"
                    description="Mitsubishi L200 (DEF-9012) - Centro de Inspeção"
                    date="23 Abr, 10:00"
                    status="warning"
                  />
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
                  <UpcomingItem
                    title="Troca de Pneus"
                    description="Volkswagen Amarok (GHI-3456) - R$ 2.800"
                    date="Ontem, 15:30"
                    status="completed"
                  />
                  <UpcomingItem
                    title="Substituição de Bateria"
                    description="Toyota Hilux (ABC-1234) - R$ 650"
                    date="20 Abr, 11:45"
                    status="completed"
                  />
                  <UpcomingItem
                    title="Reparo no Sistema Elétrico"
                    description="Chevrolet S10 (JKL-7890) - R$ 1.200"
                    date="18 Abr, 14:15"
                    status="completed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Custos e Desempenho</CardTitle>
              <CardDescription>
                Dados detalhados sobre custos, manutenção e utilização da frota
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md">
              <p className="text-muted-foreground">Dados de análise serão carregados do Supabase</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
