
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/pages/Auth/AuthContext";

const EmailSettingsTab = () => {
  const { toast } = useToast();
  const { usuario } = useAuth();
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [emailRemetente, setEmailRemetente] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    id: null,
    remetente: null,
    servidorsmtp: null,
    portasmtp: null,
    usuariosmtp: null,
    passwordsmtp: null,
    empresaid: null
  });

  useEffect(()=>{
    if(!usuario) return;
    const empresaId = 1; //usuario.empresaid;
    if (!empresaId) return;

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("tblconfiguracoesemail")
            .select("*")
            .eq("empresaid", empresaId)
            .maybeSingle();
  
          if (error) {
            if (error.code === "PGRST116") {
              // Record not found, we'll create default settings when saving
              setSettings({
                ...settings,
                empresaid: empresaId,
              });
            } else {
              throw error;
            }
          } else if (data) {
            setSmtpHost(data.servidorsmtp);
            setSmtpPort(data.portasmtp);
            setSmtpUser(data.usuariosmtp);
            setSmtpPassword(data.passwordsmtp);
            setEmailRemetente(data.remetente);
          }
        } catch (error) {
          console.error("Erro ao carregar configurações de e-mail:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar as configurações de e-mail.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
    };

    fetchSettings();
  },[toast]);

  const handleSaveEmail = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações de email no banco de dados
      const {error} = await supabase.from("tblconfiguracoesemail")
          .insert({
            remetente: emailRemetente,
            servidorsmtp: smtpHost,
            portasmtp: smtpPort,
            usuariosmtp: smtpUser,
            passwordsmtp: smtpPassword,
            empresaid: 1
          });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações de e-mail foram atualizadas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Ops",
        description: "Ocorreu um erro ao salvar as configurações de e-mail.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setSettings(null);
      setSmtpHost(null);
      setSmtpPort(null);
      setSmtpPassword(null);
      setSmtpUser(null);
      setEmailRemetente(null);
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
