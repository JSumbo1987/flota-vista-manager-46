
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, User, Building, Star, UserCog, ShieldCheck, Calendar, Key } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { gerarHashSenha } from "@/hooks/GerarHashSenha";
import bcrypt from "bcryptjs";

const PerfilUsuario = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [perfil, setPerfil] = useState<PerfilUsuarioData>({});
  const [loading, setLoading] = useState(true);
  const [showChangePass, setShowChangePass] = useState(false);
  const [PasswordAntiga, setPasswordAntiga] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error("ID do usuário não fornecido");
        }
        
        const { data, error } = await supabase
          .from("tblusuarios")
          .select(`
            *,
            tbltipousuarios (*),
            tblgrupousuarios (*),
            tblusuariofuncionario (
              tblfuncionarios (*)
            )
          `)
          .eq("userid", id)
          .single();
        
        if (error) {
          throw error;
        }
        if (data) {
          // Format the data to match our PerfilUsuarioData type
          const formattedData: PerfilUsuarioData = {
            userid: data.userid,
            usernome: data.usernome,
            useremail: data.useremail,
            tbltipousuarios: data.tbltipousuarios ? {
              descricaotipo: data.tbltipousuarios.descricaotipo
            } : undefined,
            tblgrupousuarios: data.tblgrupousuarios ? {
              gruponame: data.tblgrupousuarios.gruponame
            } : undefined,
            tblusuariofuncionario: data.tblusuariofuncionario && data.tblusuariofuncionario.tblfuncionarios ? {
              tblfuncionarios: {
                funcionarionome: data.tblusuariofuncionario.tblfuncionarios.funcionarionome,
                funcionarioemail: data.tblusuariofuncionario.tblfuncionarios.funcionarioemail,
                funcaotipoid: data.tblusuariofuncionario.tblfuncionarios.funcaotipoid,
                categoriaid: data.tblusuariofuncionario.tblfuncionarios.categoriaid,
                fotografia: data.tblusuariofuncionario.tblfuncionarios.fotografia
              }
            } : undefined
          };
          
          setPerfil(formattedData);
        }
        
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao carregar o perfil de usuário",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id, toast]);

  const getFotoPerfil = () => {
    if (perfil?.tblusuariofuncionario?.tblfuncionarios?.fotografia) {
      return perfil.tblusuariofuncionario.tblfuncionarios.fotografia;
    }
    return null;
  };

  const openChangePass = () => {
    setShowChangePass(true);
    setPasswordAntiga("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
  
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      setChangingPassword(true);

      const senhaHash = await gerarHashSenha(newPassword);
      const { data: updateData, error: updateError } = await supabase.from("tblusuarios")
        .update({ userpassword: senhaHash })
        .eq("useremail", perfil.useremail).select(); // Adicione isso;
  
      if (updateError || !updateData) {
        throw new Error("Não foi possível alterar a senha.");
      }
  
      toast({ title: "Sucesso", description: "Senha alterada com sucesso!" });
      setShowChangePass(false);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };      

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Perfil do Usuário</h2>
        <p className="text-muted-foreground">Detalhes completos do perfil de usuário</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Coluna Esquerda */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informações básicas do perfil</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                {getFotoPerfil() ? (
                  <AvatarImage src={getFotoPerfil() || ''} />
                ) : (
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {perfil?.usernome?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <h3 className="text-xl font-medium text-center">{perfil?.usernome || "Nome não disponível"}</h3>
              
              <div className="w-full mt-4 space-y-2">
                <div className="flex items-center space-x-3 bg-muted/50 p-2 rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{perfil?.useremail || "Email não disponível"}</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-muted/50 p-2 rounded-md">
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                  <span>{perfil?.tbltipousuarios?.descricaotipo || "Tipo não disponível"}</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-muted/50 p-2 rounded-md">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>{perfil?.tblgrupousuarios?.gruponame || "Grupo não disponível"}</span>
                </div>

                <div className="flex items-center space-x-3 bg-muted/50 p-2 rounded-md">
                  <Key className="h-4 w-4 text-muted-foreground" /> 
                  <Badge className="mr-2" onClick={() => openChangePass()}>Alterar senha de acesso</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Informações do Funcionário</CardTitle>
              <CardDescription>Dados do funcionário vinculado</CardDescription>
            </CardHeader>
            <CardContent>
              {perfil?.tblusuariofuncionario?.tblfuncionarios ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p>{perfil.tblusuariofuncionario.tblfuncionarios.funcionarionome}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{perfil.tblusuariofuncionario.tblfuncionarios.funcionarioemail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-md">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Função</p>
                        <p>{perfil.tblusuariofuncionario.tblfuncionarios.funcaotipoid}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-md">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Categoria</p>
                        <p>{perfil.tblusuariofuncionario.tblfuncionarios.categoriaid}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
                  <p className="text-lg text-muted-foreground">Nenhum funcionário vinculado a este usuário</p>
                </div>
              )}
            </CardContent>
          </Card>
          {showChangePass && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
                <h2 className="text-lg font-semibold">Alterar Senha</h2>

                <div className="space-y-2">
                  <label className="text-sm">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full border rounded p-2"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="w-full border rounded p-2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    className="px-4 py-2 rounded bg-muted"
                    onClick={() => setShowChangePass(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-primary text-white"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
