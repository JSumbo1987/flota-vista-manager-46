
import { useState } from "react";
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

const NotificationSettingsTab = () => {
  const { toast } = useToast();
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesPush, setNotificacoesPush] = useState(true);
  const [diasAntesVencimento, setDiasAntesVencimento] = useState("30");
  const [notificarManutencao, setNotificarManutencao] = useState(true);
  const [notificarDocumentos, setNotificarDocumentos] = useState(true);
  const [notificarAbastecimento, setNotificarAbastecimento] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações de notificações no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
            checked={notificacoesEmail}
            onCheckedChange={setNotificacoesEmail}
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
            checked={notificacoesPush}
            onCheckedChange={setNotificacoesPush}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="daysBeforeExpiry">Dias de Antecedência para Alertas</Label>
          <Select value={diasAntesVencimento} onValueChange={setDiasAntesVencimento}>
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
              checked={notificarManutencao}
              onCheckedChange={setNotificarManutencao}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="documentNotifications">Vencimento de Documentos</Label>
            <Switch
              id="documentNotifications"
              checked={notificarDocumentos}
              onCheckedChange={setNotificarDocumentos}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="fuelNotifications">Abastecimentos</Label>
            <Switch
              id="fuelNotifications"
              checked={notificarAbastecimento}
              onCheckedChange={setNotificarAbastecimento}
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
