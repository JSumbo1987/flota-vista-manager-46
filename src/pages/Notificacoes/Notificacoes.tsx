
import { useState } from "react";
import NotificacoesList from "./NotificacoesList";
import NotificacoesSettings from "./NotificacoesSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings } from "lucide-react";

const Notificacoes = () => {
  const [activeTab, setActiveTab] = useState<"list" | "settings">("list");

  return (
    <div className="space-y-4">
      <Tabs defaultValue="list" onValueChange={(value) => setActiveTab(value as "list" | "settings")}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center">
              <Bell className="mr-2 h-6 w-6" />
              Notificações
            </h2>
            <p className="text-muted-foreground">
              {activeTab === "list" 
                ? "Gerencie todas as suas notificações do sistema"
                : "Configure suas preferências de notificação"}
            </p>
          </div>

          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list">
          <NotificacoesList />
        </TabsContent>
        <TabsContent value="settings">
          <NotificacoesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notificacoes;
