
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Shield, Bell, Database, User, Building, Car, Key, Lock, Globe, Mail } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/pages/Auth/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const ConfiguracoesList = () => {
  const { toast } = useToast();
  const { usuario } = useAuth();
  const isAdmin = usuario?.permissoes.some(p => p.nome === "ADMIN") ?? false;
  
  // Estados para configurações gerais
  const [darkMode, setDarkMode] = useState(false);
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesPush, setNotificacoesPush] = useState(true);
  const [idioma, setIdioma] = useState("pt");
  const [timezone, setTimezone] = useState("Europe/Lisbon");

  // Estados para configurações de email
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [emailRemetente, setEmailRemetente] = useState("");

  // Estados para configurações de notificações
  const [diasAntesVencimento, setDiasAntesVencimento] = useState("30");
  const [notificarManutencao, setNotificarManutencao] = useState(true);
  const [notificarDocumentos, setNotificarDocumentos] = useState(true);
  const [notificarAbastecimento, setNotificarAbastecimento] = useState(true);

  // Estados para configurações de empresa
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [enderecoEmpresa, setEnderecoEmpresa] = useState("");
  const [telefoneEmpresa, setTelefoneEmpresa] = useState("");
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [logoEmpresa, setLogoEmpresa] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações gerais no banco de dados
      // Por enquanto, só simulamos com um timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações gerais foram atualizadas com sucesso."
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

  const handleSaveCompany = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações da empresa no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da empresa foram atualizadas com sucesso."
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
                </>
              )}
            </TabsList>
            
            {/* Configurações Gerais */}
            <TabsContent value="geral" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativa o tema escuro na interface do sistema
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={idioma} onValueChange={setIdioma}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português (Portugal)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Lisbon">Lisboa (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova Iorque (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveGeneral} 
                className="mt-4 w-full sm:w-auto" 
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </TabsContent>
            
            {/* Configurações de Notificações */}
            <TabsContent value="notificacoes" className="space-y-4">
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
            </TabsContent>
            
            {/* Configurações de Email (apenas admin) */}
            <TabsContent value="email" className="space-y-4">
              {isAdmin ? (
                <>
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
                </>
              ) : (
                <p>Você não tem permissão para acessar esta seção.</p>
              )}
            </TabsContent>
            
            {/* Configurações da Empresa (apenas admin) */}
            <TabsContent value="empresa" className="space-y-4">
              {isAdmin ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input
                        id="companyName"
                        placeholder="Flota Vista Ltda."
                        value={nomeEmpresa}
                        onChange={(e) => setNomeEmpresa(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="companyAddress">Endereço</Label>
                      <Input
                        id="companyAddress"
                        placeholder="Rua Exemplo, 123, Cidade"
                        value={enderecoEmpresa}
                        onChange={(e) => setEnderecoEmpresa(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Telefone</Label>
                      <Input
                        id="companyPhone"
                        placeholder="+351 123 456 789"
                        value={telefoneEmpresa}
                        onChange={(e) => setTelefoneEmpresa(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        placeholder="contato@flotavista.com"
                        value={emailEmpresa}
                        onChange={(e) => setEmailEmpresa(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="companyLogo">Logo da Empresa</Label>
                      <Input
                        id="companyLogo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoEmpresa(e.target.files?.[0] || null)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Formatos aceitos: JPG, PNG (máximo 2MB)
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSaveCompany} 
                    className="mt-4 w-full sm:w-auto" 
                    disabled={isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </>
              ) : (
                <p>Você não tem permissão para acessar esta seção.</p>
              )}
            </TabsContent>
            
            {/* Configurações de Segurança (apenas admin) */}
            <TabsContent value="seguranca" className="space-y-4">
              {isAdmin ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Label htmlFor="twoFactorAuth">Autenticação de Dois Fatores</Label>
                          <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em Breve</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Exigir verificação adicional ao fazer login
                        </p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        disabled
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Política de Senhas</Label>
                      <div className="space-y-2 pl-4">
                        <div className="flex items-center">
                          <Switch id="passwordMinLength" defaultChecked disabled />
                          <Label htmlFor="passwordMinLength" className="ml-2">
                            Mínimo de 8 caracteres
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Switch id="passwordSpecialChar" defaultChecked disabled />
                          <Label htmlFor="passwordSpecialChar" className="ml-2">
                            Caracteres especiais obrigatórios
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Switch id="passwordExpiry" defaultChecked disabled />
                          <Label htmlFor="passwordExpiry" className="ml-2">
                            Expirar senhas a cada 90 dias
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Tempo Limite de Sessão</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="sessionTimeout">
                          <SelectValue placeholder="Selecione o tempo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                          <SelectItem value="never">Nunca expirar</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tempo de inatividade antes de encerrar sessão automaticamente
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="mt-4 w-full sm:w-auto" 
                    disabled={true}
                  >
                    Salvar Configurações
                  </Button>
                </>
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
