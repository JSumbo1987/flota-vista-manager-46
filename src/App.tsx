import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard";
import CertificadosList from "./pages/Certificados/CertificadosList";
import AddCertificado from "./pages/Certificados/AddCertificado";
import NotFound from "./pages/NotFound";
import ViaturaList from "./pages/Viaturas/ViaturasList";
import FuncionariosList from "./pages/Funcionarios/FuncionariosList";
import AgendamentoList from "./pages/Agendamentos/AgendamentoList";
import ServicosList from "./pages/Servicos/ServicosList";
import ChecklistsList from "./pages/CheckList/CheckList";
import LicencaTransporteList from "./pages/LicencasTransportes/LicencasTransporteList";
import LicencaPublicidadeList from "./pages/LicencasPublicidades/LicencasPublicidadeList";
import AddViatura from "./pages/Viaturas/AddViaturas";
import EditViatura from "./pages/Viaturas/EditViatura";
import AddFuncionario from "./pages/Funcionarios/AddFuncionario";
import EditarFuncionario from "./pages/Funcionarios/EditarFuncionario";
import { AuthProvider } from "./pages/Auth/AuthContext";
import AddAgendamento from "./pages/Agendamentos/AddAgendamento";
import EditAgendamento from "./pages/Agendamentos/EditAgendamento";
import AddServico from "./pages/Servicos/AddServicos";
import EditServico from "./pages/Servicos/EditServicos";
import AddChecklist from "./pages/CheckList/AddCheckList";
import ChecklistDetails from "./pages/CheckList/ChecklistDetails";
import EditChecklist from "./pages/CheckList/EditCheckList";
import EditCertificado from "./pages/Certificados/EditCertificado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rota de autenticação */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />

            {/* Certificados */}
            <Route
              path="/certificados"
              element={
                <MainLayout>
                  <CertificadosList />
                </MainLayout>
              }
            />
            <Route
              path="/certificados/add"
              element={
                <MainLayout>
                  <AddCertificado />
                </MainLayout>
              }
            />
            <Route
              path="/certificados/edit/:id"
              element={
                <MainLayout>
                  <EditCertificado />
                </MainLayout>
              }
            />

            {/* Viaturas */}
            <Route
              path="/viaturas"
              element={
                <MainLayout>
                  <ViaturaList />
                </MainLayout>
              }
            />
            <Route
              path="/viaturas/add"
              element={
                <MainLayout>
                  <AddViatura />
                </MainLayout>
              }
            />
            <Route
              path="/viaturas/edit/:viaturaId"
              element={
                <MainLayout>
                  <EditViatura />
                </MainLayout>
              }
            />

            {/* Funcionários */}
            <Route
              path="/funcionarios"
              element={
                <MainLayout>
                  <FuncionariosList />
                </MainLayout>
              }
            />
            <Route
              path="/funcionarios/add"
              element={
                <MainLayout>
                  <AddFuncionario />
                </MainLayout>
              }
            />
            <Route
              path="/funcionarios/edit/:funcionarioid"
              element={
                <MainLayout>
                  <EditarFuncionario />
                </MainLayout>
              }
            />

            {/* Outras rotas */}
            <Route
              path="/agendamentos"
              element={
                <MainLayout>
                  <AgendamentoList />
                </MainLayout>
              }
            />
            <Route
              path="/agendamentos/add"
              element={
                <MainLayout>
                  <AddAgendamento />
                </MainLayout>
              }
            />
            <Route
              path="/agendamentos/edit/:id"
              element={
                <MainLayout>
                  <EditAgendamento />
                </MainLayout>
              }
            />
            <Route
              path="/servicos"
              element={
                <MainLayout>
                  <ServicosList />
                </MainLayout>
              }
            />
            <Route
              path="/servicos/add"
              element={
                <MainLayout>
                  <AddServico />
                </MainLayout>
              }
            />
            <Route
              path="/servicos/edit/:id"
              element={
                <MainLayout>
                  <EditServico />
                </MainLayout>
              }
            />
            <Route
              path="/checklist"
              element={
                <MainLayout>
                  <ChecklistsList />
                </MainLayout>
              }
            />
            <Route
              path="/checklist/add"
              element={
                <MainLayout>
                  <AddChecklist />
                </MainLayout>
              }
            />
            <Route
              path="/checklist/edit/:id"
              element={
                <MainLayout>
                  <EditChecklist />
                </MainLayout>
              }
            />
            <Route
              path="/checklist/viewDetails/:id"
              element={
                <MainLayout>
                  <ChecklistDetails />
                </MainLayout>
              }
            />
            <Route
              path="/licenca-transporte"
              element={
                <MainLayout>
                  <LicencaTransporteList />
                </MainLayout>
              }
            />
            <Route
              path="/licenca-publicidade"
              element={
                <MainLayout>
                  <LicencaPublicidadeList />
                </MainLayout>
              }
            />
            <Route
              path="/usuarios"
              element={
                <MainLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Gestão de Usuários</h2>
                    <p>Página em implementação</p>
                  </div>
                </MainLayout>
              }
            />
            <Route
              path="/notificacoes"
              element={
                <MainLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Notificações</h2>
                    <p>Página em implementação</p>
                  </div>
                </MainLayout>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <MainLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Configurações</h2>
                    <p>Página em implementação</p>
                  </div>
                </MainLayout>
              }
            />
            <Route
              path="/perfil"
              element={
                <MainLayout>
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Meu Perfil</h2>
                    <p>Página em implementação</p>
                  </div>
                </MainLayout>
              }
            />

            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

