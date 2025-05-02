import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/pages/Auth/AuthContext";
import { CheckCircle, Bell, AlertCircle } from "lucide-react";

interface NotificationSettings {
  userid: string;
  email_notifications: boolean;
  system_notifications: boolean;
  maintenance_alerts: boolean;
  inspection_reminders: boolean;
  license_expiration: boolean;
}

const NotificacoesSettings = () => {
  const { toast } = useToast();
  const { usuario } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    userid: "",
    email_notifications: true,
    system_notifications: true,
    maintenance_alerts: true,
    inspection_reminders: true,
    license_expiration: true,
  });

  useEffect(() => {
    if (!usuario) return;
    
    const userId = usuario.userid || usuario.id;
    if (!userId) return;

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("tblnotificacoes_config")
          .select("*")
          .eq("userid", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // Record not found, we'll create default settings when saving
            setSettings({
              ...settings,
              userid: userId,
            });
          } else {
            throw error;
          }
        } else if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas configurações de notificação",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [usuario, toast]);

  const handleToggleChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    if (!usuario) return;
    
    const userId = usuario.userid || usuario.id;
    if (!userId) return;

    setIsSaving(true);
    try {
      // Check if settings exist for this user
      const { data: existingSettings } = await supabase
        .from("tblnotificacoes_config")
        .select("userid")
        .eq("userid", userId)
        .single();

      let error;

      if (existingSettings) {
        // Update existing settings
        ({ error } = await supabase
          .from("tblnotificacoes_config")
          .update(settings)
          .eq("userid", userId));
      } else {
        // Insert new settings
        ({ error } = await supabase
          .from("tblnotificacoes_config")
          .insert({ ...settings, userid: userId }));
      }

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Notificação</CardTitle>
        <CardDescription>
          Defina como e quando você deseja receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Canais de Notificação
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications" className="text-base">
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas importantes diretamente no seu email
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => 
                    handleToggleChange("email_notifications", checked)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="system_notifications" className="text-base">
                    Notificações do Sistema
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações dentro do sistema
                  </p>
                </div>
                <Switch
                  id="system_notifications"
                  checked={settings.system_notifications}
                  onCheckedChange={(checked) =>
                    handleToggleChange("system_notifications", checked)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Tipos de Alertas
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance_alerts" className="text-base">
                    Alertas de Manutenção
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas sobre manutenções programadas e necessárias
                  </p>
                </div>
                <Switch
                  id="maintenance_alerts"
                  checked={settings.maintenance_alerts}
                  onCheckedChange={(checked) =>
                    handleToggleChange("maintenance_alerts", checked)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inspection_reminders" className="text-base">
                    Lembretes de Inspeção
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado sobre inspeções pendentes e datas de vencimento
                  </p>
                </div>
                <Switch
                  id="inspection_reminders"
                  checked={settings.inspection_reminders}
                  onCheckedChange={(checked) =>
                    handleToggleChange("inspection_reminders", checked)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="license_expiration" className="text-base">
                    Expiração de Licenças
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas quando licenças estiverem próximas de expirar
                  </p>
                </div>
                <Switch
                  id="license_expiration"
                  checked={settings.license_expiration}
                  onCheckedChange={(checked) =>
                    handleToggleChange("license_expiration", checked)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={saveSettings}
              disabled={isLoading || isSaving}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Preferências"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificacoesSettings;
