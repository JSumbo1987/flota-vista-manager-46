
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard";
import CertificadosList from "./pages/Certificados/CertificadosList";
import AddCertificado from "./pages/Certificados/AddCertificado";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
                <AddCertificado />
              </MainLayout>
            }
          />
          
          {/* Rotas de placeholder para as próximas implementações */}
          <Route
            path="/viaturas"
            element={
              <MainLayout>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Gestão de Viaturas</h2>
                  <p>Página em implementação</p>
                </div>
              </MainLayout>
            }
          />
          <Route
            path="/funcionarios"
            element={
              <MainLayout>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Gestão de Funcionários</h2>
                  <p>Página em implementação</p>
                </div>
              </MainLayout>
            }
          />
          <Route
            path="/agendamentos"
            element={
              <MainLayout>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Agendamentos</h2>
                  <p>Página em implementação</p>
                </div>
              </MainLayout>
            }
          />
          <Route
            path="/servicos"
            element={
              <MainLayout>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Serviços</h2>
                  <p>Página em implementação</p>
                </div>
              </MainLayout>
            }
          />
          <Route
            path="/checklist"
            element={
              <MainLayout>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Checklists</h2>
                  <p>Página em implementação</p>
                </div>
              </MainLayout>
            }
          />
          <Route
            path="/licenca-transporte"
            element={
              <MainLayout>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Licenças de Transporte</h2>
                  <p>Página em implementação</p>
                </div>
              </MainLayout>
            }
          />
          <Route
            path="/licenca-publicidade"
            element={
              <MainLayout>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Licenças de Publicidade</h2>
                  <p>Página em implementação</p>
                </div>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
