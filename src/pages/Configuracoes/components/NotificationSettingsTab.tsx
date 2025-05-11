
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/pages/Auth/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface NotificationSettings {
  id: string;
  usuarioid: number | null;
  email: boolean;
  push: boolean;
  diasantesvencimento: number;
  manutencao: boolean;
  documentos: boolean;
  servicos: boolean;
}


const NotificationSettingsTab = () => {
  const { toast } = useToast();
  const { usuario } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
      id: "",
      usuarioid: null,
      email: false,
      push: false,
      manutencao: false,
      documentos: false,
      diasantesvencimento: 0,
      servicos: false,
    });

  useEffect(()=>{
    if (!usuario) return;
    const userId = usuario.userid || usuario.funcionarioId;
    if (!userId) return;

    const fetchSettings = async () => {
          setIsLoading(true);
          try {
            const { data, error } = await supabase
              .from("tblconfiguracoesnotificacoes")
              .select("*")
              .eq("usuarioid", userId)
              .maybeSingle();
    
            if (error) {
              if (error.code === "PGRST116") {
                // Record not found, we'll create default settings when saving
                setSettings({
                  ...settings,
                  usuarioid: userId,
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
              description: "Não foi possível carregar as configurações de notificação",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
    };
    
    fetchSettings();

  },[usuario, toast]);

  const handleToggleChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveNotifications = async () => {
    if (!usuario) return;
    
    const userId = usuario.userid || usuario.funcionarioId;
    if (!userId) return;
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações de notificações no banco de dados.
      // Verifica se as configurações existem para este usuário.
      const { data: existingSettings } = await supabase
        .from("tblconfiguracoesnotificacoes")
        .select("usuarioid")
        .eq("usuarioid", userId)
        .maybeSingle();

      let error;

      if (existingSettings) {
        // Update existing settings
        ({ error } = await supabase
          .from("tblconfiguracoesnotificacoes")
          .update(settings)
          .eq("usuarioid", userId));
      } else {
        
        // Insert new settings
        ({ error } = await supabase
          .from("tblconfiguracoesnotificacoes")
          .insert({
            usuarioid: userId,
            email: settings.email,
            push: settings.push,
            manutencao: settings.manutencao,
            documentos: settings.documentos,
            diasantesvencimento: settings.diasantesvencimento,
            servicos: settings.servicos
          }));
      }

      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de notificações foram atualizadas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailNotifications">Notificações por Email</Label>
            <p className="text-sm text-muted-foreground">
              Receba notificações importantes por email
            </p>
          </div>
          <Switch
            id="emailNotifications"
            checked={settings.email}
            onCheckedChange={(checked) => handleToggleChange("email", checked) }
            disabled={isLoading}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="pushNotifications">Notificações no Sistema</Label>
            <p className="text-sm text-muted-foreground">
              Receba notificações em tempo real no sistema
            </p>
          </div>
          <Switch
            id="pushNotifications"
            checked={settings.push}
            onCheckedChange={(checked) => handleToggleChange("push", checked) }
            disabled={isLoading}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="daysBeforeExpiry">Dias de Antecedência para Alertas</Label>
          <Select value={settings.diasantesvencimento.toString() ?? ""} onValueChange={(value) =>
            setSettings((prev) => ({ ...prev, diasantesvencimento: parseInt(value, 10), }))}>
            <SelectTrigger id="daysBeforeExpiry">
              <SelectValue placeholder="Selecione os dias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="15">15 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Número de dias antes do vencimento de documentos para receber alertas
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Tipos de Notificações</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenanceNotifications">Manutenção de Viaturas</Label>
            <Switch
              id="maintenanceNotifications"
              checked={settings.manutencao}
              onCheckedChange={(checked) => handleToggleChange("manutencao", checked) }
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="documentNotifications">Vencimento de Documentos</Label>
            <Switch
              id="documentNotifications"
              checked={settings.documentos}
              onCheckedChange={(checked) => handleToggleChange("documentos", checked) }
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="serviceNotifications">Serviços já realizados</Label>
            <Switch
              id="serviceNotifications"
              checked={settings.servicos}
              onCheckedChange={(checked) => handleToggleChange("servicos", checked) }
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleSaveNotifications} 
        className="mt-4 w-full sm:w-auto" 
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};

export default NotificationSettingsTab;
