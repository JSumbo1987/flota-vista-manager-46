
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

interface UserDetails {
  userid: string;
  usernome: string;
  useremail: string;
  estado: string;
  issuperusuario: boolean;
  isfastlogin: number;
  useremailconfirmed: boolean;
  tbltipousuarios?: { descricao: string };
  tblgrupousuarios?: { nome: string };
  tblusuariofuncionario?: {
    tblfuncionarios?: {
      funcionarionome: string;
      funcionarioemail: string;
      funcaotipoid: string;
      categoriaid: string;
      fotografia?: string | null;
    };
  }[];
}

const UserDetailsModal = ({ isOpen, onClose, userId }: UserDetailsModalProps) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId || !isOpen) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("tblusuarios")
          .select(`
            userid,
            usernome,
            useremail,
            estado,
            issuperusuario,
            isfastlogin,
            useremailconfirmed,
            tbltipousuarios(descricao),
            tblgrupousuarios(nome),
            tblusuariofuncionario(
              tblfuncionarios(funcionarionome, funcionarioemail, funcaotipoid, categoriaid, fotografia)
            )
          `)
          .eq("userid", userId)
          .single();

        if (error) throw error;
        
        // Properly cast and format the data to match the UserDetails interface
        const formattedData: UserDetails = {
          userid: data.userid,
          usernome: data.usernome,
          useremail: data.useremail,
          estado: data.estado,
          issuperusuario: data.issuperusuario,
          isfastlogin: data.isfastlogin,
          useremailconfirmed: data.useremailconfirmed,
          tbltipousuarios: data.tbltipousuarios,
          tblgrupousuarios: data.tblgrupousuarios,
          tblusuariofuncionario: data.tblusuariofuncionario
        };
        
        setUserDetails(formattedData);

        // Fetch photo URL if available
        const fotoPath = data.tblusuariofuncionario?.[0]?.tblfuncionarios?.fotografia;
        if (fotoPath) {
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from("funcionarios")
            .createSignedUrl(fotoPath, 60);
          
          if (!urlError && signedUrlData?.signedUrl) {
            setFotoUrl(signedUrlData.signedUrl);
          }
        } else {
          setFotoUrl(null);
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, isOpen]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "activo":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "inactivo":
        return <Badge variant="secondary">Inativo</Badge>;
      case "suspenso":
        return <Badge variant="destructive">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações completas do usuário
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  {fotoUrl ? (
                    <AvatarImage src={fotoUrl} alt={userDetails.usernome} />
                  ) : null}
                  <AvatarFallback>{userDetails.usernome[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{userDetails.usernome}</h3>
                  <p className="text-sm text-muted-foreground">{userDetails.useremail}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    {getStatusBadge(userDetails.estado)}
                    {userDetails.issuperusuario && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        Super Usuário
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm font-medium">Tipo de Usuário</p>
                  <p className="text-sm text-muted-foreground">
                    {userDetails.tbltipousuarios?.descricao || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Grupo</p>
                  <p className="text-sm text-muted-foreground">
                    {userDetails.tblgrupousuarios?.nome || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email Confirmado</p>
                  <p className="text-sm text-muted-foreground">
                    {userDetails.useremailconfirmed ? "Sim" : "Não"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Primeiro Acesso</p>
                  <p className="text-sm text-muted-foreground">
                    {userDetails.isfastlogin === 0 ? "Sim" : "Não"}
                  </p>
                </div>
              </div>

              {userDetails.tblusuariofuncionario?.[0]?.tblfuncionarios && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Informações do Funcionário</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <p className="text-sm font-medium">Nome</p>
                      <p className="text-sm text-muted-foreground">
                        {userDetails.tblusuariofuncionario[0].tblfuncionarios.funcionarionome}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Corporativo</p>
                      <p className="text-sm text-muted-foreground">
                        {userDetails.tblusuariofuncionario[0].tblfuncionarios.funcionarioemail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Função</p>
                      <p className="text-sm text-muted-foreground">
                        {userDetails.tblusuariofuncionario[0].tblfuncionarios.funcaotipoid}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Categoria</p>
                      <p className="text-sm text-muted-foreground">
                        {userDetails.tblusuariofuncionario[0].tblfuncionarios.categoriaid}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-4">Usuário não encontrado.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
