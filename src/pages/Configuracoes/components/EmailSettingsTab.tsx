
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EmailSettingsTab = () => {
  const { toast } = useToast();
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [emailRemetente, setEmailRemetente] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEmail = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações de email no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de email foram atualizadas com sucesso."
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="smtpHost">Servidor SMTP</Label>
          <Input
            id="smtpHost"
            placeholder="smtp.exemplo.com"
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smtpPort">Porta SMTP</Label>
          <Input
            id="smtpPort"
            placeholder="587"
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smtpUser">Usuário SMTP</Label>
          <Input
            id="smtpUser"
            placeholder="usuario@exemplo.com"
            value={smtpUser}
            onChange={(e) => setSmtpUser(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smtpPassword">Senha SMTP</Label>
          <Input
            id="smtpPassword"
            type="password"
            placeholder="••••••••"
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="emailFrom">Email de Remetente</Label>
          <Input
            id="emailFrom"
            placeholder="noreply@flotavista.com"
            value={emailRemetente}
            onChange={(e) => setEmailRemetente(e.target.value)}
          />
        </div>
      </div>
      
      <Button 
        onClick={handleSaveEmail} 
        className="mt-4 w-full sm:w-auto" 
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};

export default EmailSettingsTab;
