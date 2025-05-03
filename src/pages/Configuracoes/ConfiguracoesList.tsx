
import { useState } from "react";
import { Settings, Shield, Bell, Database, User, Building, Car, Key, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/Auth/AuthContext";

// Import the extracted components
import GeneralSettingsTab from "./components/GeneralSettingsTab";
import NotificationSettingsTab from "./components/NotificationSettingsTab";
import EmailSettingsTab from "./components/EmailSettingsTab";
import CompanySettingsTab from "./components/CompanySettingsTab";
import SecuritySettingsTab from "./components/SecuritySettingsTab";
import PermissionsTab from "./components/PermissionsTab";

const ConfiguracoesList = () => {
  const { toast } = useToast();
  const { usuario } = useAuth();
  const isAdmin = (usuario?.permissoes ?? []).some(p => p.nome === "ADMIN");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Personalize as configurações do sistema</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription>
            Ajuste as configurações do sistema de acordo com suas preferências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="geral">
            <TabsList className="mb-4">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="empresa">Empresa</TabsTrigger>
                  <TabsTrigger value="seguranca">Segurança</TabsTrigger>
                  <TabsTrigger value="permissoes">Permissões</TabsTrigger>
                </>
              )}
            </TabsList>
            
            {/* General Tab */}
            <TabsContent value="geral">
              <GeneralSettingsTab />
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notificacoes">
              <NotificationSettingsTab />
            </TabsContent>
            
            {/* Email Tab (Admin Only) */}
            <TabsContent value="email">
              {isAdmin ? (
                <EmailSettingsTab />
              ) : (
                <p>Você não tem permissão para acessar esta seção.</p>
              )}
            </TabsContent>
            
            {/* Company Tab (Admin Only) */}
            <TabsContent value="empresa">
              {isAdmin ? (
                <CompanySettingsTab />
              ) : (
                <p>Você não tem permissão para acessar esta seção.</p>
              )}
            </TabsContent>
            
            {/* Security Tab (Admin Only) */}
            <TabsContent value="seguranca">
              {isAdmin ? (
                <SecuritySettingsTab />
              ) : (
                <p>Você não tem permissão para acessar esta seção.</p>
              )}
            </TabsContent>
            
            {/* Permissions Tab (Admin Only) */}
            <TabsContent value="permissoes">
              {isAdmin ? (
                <PermissionsTab />
              ) : (
                <p>Você não tem permissão para acessar esta seção.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4 pb-2">
          <p className="text-xs text-muted-foreground">
            Algumas configurações podem exigir a reinicialização do sistema para ter efeito.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfiguracoesList;
