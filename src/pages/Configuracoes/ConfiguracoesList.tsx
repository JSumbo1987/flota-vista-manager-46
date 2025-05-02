import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings, Shield, Bell, Database, User, Building, Car, Key, Lock, Globe, Mail, 
  Users, Edit, Trash2, Eye, Plus
} from "lucide-react";
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

interface MenuPermission {
  id: string;
  name: string;
  canInsert: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}

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

  // Estados para configurações de permissões
  const [selectedPermissionType, setSelectedPermissionType] = useState<"users" | "groups">("users");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [groups, setGroups] = useState<{id: string, name: string}[]>([]);
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([
    { id: "dashboard", name: "Dashboard", canInsert: false, canEdit: false, canDelete: false, canView: true },
    { id: "viaturas", name: "Viaturas", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "funcionarios", name: "Funcionários", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "agendamentos", name: "Agendamentos", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "servicos", name: "Serviços", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "checklist", name: "Checklist", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "certificados", name: "Certificados", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "licenca-transporte", name: "Licença Transporte", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "licenca-publicidade", name: "Licença Publicidade", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "usuarios", name: "Usuários", canInsert: true, canEdit: true, canDelete: true, canView: true },
    { id: "notificacoes", name: "Notificações", canInsert: false, canEdit: true, canDelete: true, canView: true },
    { id: "configuracoes", name: "Configurações", canInsert: false, canEdit: true, canDelete: false, canView: true },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  // Carrega usuários e grupos quando o componente é montado
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchGroups();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('tblusuarios')
        .select('userid, usernome')
        .order('usernome');
      
      if (error) throw error;
      
      setUsers(data.map(user => ({
        id: user.userid,
        name: user.usernome
      })));
      
      if (data.length > 0) {
        setSelectedUser(data[0].userid);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive"
      });
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('tblgrupousuarios')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      
      setGroups(data.map(group => ({
        id: group.id,
        name: group.nome
      })));
      
      if (data.length > 0) {
        setSelectedGroup(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de grupos",
        variant: "destructive"
      });
    }
  };

  const handlePermissionChange = (menuId: string, permission: 'canInsert' | 'canEdit' | 'canDelete' | 'canView', value: boolean) => {
    setMenuPermissions(prev => 
      prev.map(menu => 
        menu.id === menuId 
          ? { ...menu, [permission]: value }
          : menu
      )
    );
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações de permissões no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Permissões salvas",
        description: `As permissões para ${selectedPermissionType === 'users' ? 'o usuário' : 'o grupo'} foram atualizadas com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as permissões.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações gerais no banco de dados
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
                  <TabsTrigger value="permissoes">Permissões</TabsTrigger>
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
            
            {/* Configurações de Permissões (apenas admin) */}
            <TabsContent value="permissoes" className="space-y-4">
              {isAdmin ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant={selectedPermissionType === "users" ? "default" : "outline"} 
                        onClick={() => setSelectedPermissionType("users")}
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Usuários</span>
                      </Button>
                      <Button 
                        variant={selectedPermissionType === "groups" ? "default" : "outline"} 
                        onClick={() => setSelectedPermissionType("groups")}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        <span>Grupos de Usuários</span>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-or-group">
                        {selectedPermissionType === "users" ? "Usuário" : "Grupo de Usuários"}
                      </Label>
                      
                      {selectedPermissionType === "users" ? (
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                          <SelectTrigger id="user-select">
                            <SelectValue placeholder="Selecione um usuário" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                          <SelectTrigger id="group-select">
                            <SelectValue placeholder="Selecione um grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map(group => (
                              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Menu</TableHead>
                            <TableHead className="text-center w-24">
                              <div className="flex items-center justify-center gap-1">
                                <Plus className="h-4 w-4" />
                                <span>Inserir</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-center w-24">
                              <div className="flex items-center justify-center gap-1">
                                <Edit className="h-4 w-4" />
                                <span>Editar</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-center w-24">
                              <div className="flex items-center justify-center gap-1">
                                <Trash2 className="h-4 w-4" />
                                <span>Excluir</span>
                              </div>
                            </TableHead>
                            <TableHead className="text-center w-24">
                              <div className="flex items-center justify-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>Visualizar</span>
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {menuPermissions.map(menu => (
                            <TableRow key={menu.id}>
                              <TableCell className="font-medium">{menu.name}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <Switch
                                    checked={menu.canInsert}
                                    onCheckedChange={(value) => handlePermissionChange(menu.id, 'canInsert', value)}
                                    disabled={menu.id === "dashboard" || menu.id === "notificacoes" || menu.id === "configuracoes"}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <Switch
                                    checked={menu.canEdit}
                                    onCheckedChange={(value) => handlePermissionChange(menu.id, 'canEdit', value)}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <Switch
                                    checked={menu.canDelete}
                                    onCheckedChange={(value) => handlePermissionChange(menu.id, 'canDelete', value)}
                                    disabled={menu.id === "dashboard" || menu.id === "configuracoes"}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <Switch
                                    checked={menu.canView}
                                    onCheckedChange={(value) => handlePermissionChange(menu.id, 'canView', value)}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSavePermissions} 
                    className="mt-4 w-full sm:w-auto" 
                    disabled={isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar Permissões"}
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
