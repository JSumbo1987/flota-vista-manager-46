
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ResetPasswordDialog from "@/components/usuarios/ResetPasswordDialog";
import { Check, X, Shield, User, Mail, Calendar, Clock, Building, Star, Key, UserCog, LockKeyhole, BadgeCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userID: string | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, userID }) => {
  const { toast } = useToast();
  const [userDetails, setUserDetails] = useState<UserDetails>({} as UserDetails);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userID) return;
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('tblusuarios')
          .select(`
            *,
            tbltipousuarios(*),
            tblgrupousuarios(*),
            tblusuariofuncionario(
              tblfuncionarios(*)
            )
          `)
          .eq('userid', userID)
          .single();
          
        if (error) {
          console.error("Error fetching user details:", error);
          toast({
            title: "Erro ao carregar detalhes do usuário",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          // Transform the returned data to match the UserDetails interface
          const formattedUserDetails: UserDetails = {
            userid: data.userid,
            usernome: data.usernome,
            useremail: data.useremail,
            estado: data.estado,
            issuperusuario: Boolean(data.issuperusuario),
            isfastlogin: Number(data.isfastlogin || 0),
            useremailconfirmed: Boolean(data.useremailconfirmed),
            tbltipousuarios: {
              descricao: data.tbltipousuarios?.descricao || "N/A",
            },
            tblgrupousuarios: {
              nome: data.tblgrupousuarios?.nome || "N/A",
            },
            tblusuariofuncionario: {
              tblfuncionarios: data.tblusuariofuncionario?.tblfuncionarios ? {
                funcionarionome: data.tblusuariofuncionario.tblfuncionarios.funcionarionome,
                funcionarioemail: data.tblusuariofuncionario.tblfuncionarios.funcionarioemail,
                funcaotipoid: data.tblusuariofuncionario.tblfuncionarios.funcaotipoid,
                categoriaid: data.tblusuariofuncionario.tblfuncionarios.categoriaid,
                fotografia: data.tblusuariofuncionario.tblfuncionarios.fotografia
              } : undefined
            }
          };
          
          setUserDetails(formattedUserDetails);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast({
          title: "Erro ao carregar detalhes do usuário",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen && userID) {
      fetchUserDetails();
    }
  }, [isOpen, userID, toast]);
  
  if (!isOpen) return null;
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <UserCog className="mr-2 h-5 w-5" />
              Detalhes do Usuário
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a conta e permissões do usuário
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Header Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  {userDetails.tblusuariofuncionario?.tblfuncionarios?.fotografia ? (
                    <AvatarImage 
                      src={userDetails.tblusuariofuncionario.tblfuncionarios.fotografia}
                      alt={userDetails.usernome || "Usuário"}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {userDetails.usernome?.substring(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    {userDetails.usernome || "N/A"}
                    {userDetails.issuperusuario && (
                      <Badge variant="secondary" className="ml-2 flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{userDetails.useremail || "N/A"}</p>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant={userDetails.estado === "Activo" ? "outline" : "destructive"} 
                      className="mr-2"
                    >
                      {userDetails.estado || "N/A"}
                    </Badge>
                    
                    {userDetails.useremailconfirmed ? (
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-600 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Email verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Email não verificado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-semibold border-b pb-1">Informações da Conta</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Nome</p>
                        <p className="text-sm text-muted-foreground">{userDetails.usernome || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">E-mail</p>
                        <p className="text-sm text-muted-foreground">{userDetails.useremail || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Star className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tipo de Usuário</p>
                        <p className="text-sm text-muted-foreground">{userDetails.tbltipousuarios?.descricao || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <UserCog className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Grupo</p>
                        <p className="text-sm text-muted-foreground">{userDetails.tblgrupousuarios?.nome || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Key className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Fast Login</p>
                        <p className="text-sm text-muted-foreground">
                          {userDetails.isfastlogin ? "Ativado" : "Desativado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {userDetails.tblusuariofuncionario?.tblfuncionarios && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <h4 className="font-semibold border-b pb-1">Funcionário Vinculado</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <BadgeCheck className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Nome do Funcionário</p>
                          <p className="text-sm text-muted-foreground">
                            {userDetails.tblusuariofuncionario.tblfuncionarios.funcionarionome || "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">E-mail do Funcionário</p>
                          <p className="text-sm text-muted-foreground">
                            {userDetails.tblusuariofuncionario.tblfuncionarios.funcionarioemail || "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Função</p>
                          <p className="text-sm text-muted-foreground">
                            {userDetails.tblusuariofuncionario.tblfuncionarios.funcaotipoid || "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Building className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Categoria</p>
                          <p className="text-sm text-muted-foreground">
                            {userDetails.tblusuariofuncionario.tblfuncionarios.categoriaid || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center pt-4 gap-2">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
            <Button 
              variant="secondary" 
              className="flex items-center"
              onClick={() => setIsResetPasswordOpen(true)}
              disabled={isLoading}
            >
              <LockKeyhole className="h-4 w-4 mr-2" />
              Resetar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ResetPasswordDialog 
        isOpen={isResetPasswordOpen} 
        onClose={() => setIsResetPasswordOpen(false)} 
        userID={userID}
        userName={userDetails.usernome || ''}
      />
    </>
  );
};

export default UserDetailsModal;
