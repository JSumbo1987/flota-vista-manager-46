import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PerfilUsuarioData {
  userid: string;
  usernome: string;
  useremail: string;
  tbltipousuarios?: { descricaotipo: string };
  tblgrupousuarios?: { gruponame: string };
  tblusuariofuncionario?: {
    tblfuncionarios?: {
      funcionarionome: string;
      funcionarioemail: string;
      funcaotipoid: string;
      categoriaid: string;
      fotografia?: string | null;
    };
  };
}

const PerfilUsuario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilUsuarioData | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!id) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("tblusuarios")
        .select(`
          userid,
          usernome,
          useremail,
          tbltipousuarios(descricaotipo),
          tblgrupousuarios(gruponame),
          tblusuariofuncionario(
            tblfuncionarios(funcionarionome, funcionarioemail, funcaotipoid, categoriaid, fotografia)
          )
        `)
        .eq("userid", id)
        .single();

      if (error || !data) {
        console.error("Erro ao buscar perfil:", error?.message);
        setIsLoading(false);
        return;
      }

      const fotoPath = data.tblusuariofuncionario?.tblfuncionarios?.fotografia;
      if (fotoPath) {
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from("funcionarios")
          .createSignedUrl(fotoPath, 60);
        if (!urlError && signedUrlData?.signedUrl) {
          setFotoUrl(signedUrlData.signedUrl);
        }
      }

      setPerfil(data);
      setIsLoading(false);
    };

    fetchPerfil();
  }, [id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/funcionarios")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Perfil do Usuário</h2>
          <p className="text-muted-foreground">Detalhes vinculados ao funcionário</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-start justify-between">
            <div className="flex-1">
                <CardTitle>Informações do Usuário</CardTitle>
                <CardDescription>Dados principais do sistema</CardDescription>
            </div>
            {fotoUrl && (
            <div className="absolute top-24 right-10">
                <Avatar className="w-24 h-24 rounded-full border shadow-md">
                <AvatarImage src={fotoUrl} alt="Foto do Funcionário" />
                <AvatarFallback>{perfil?.usernome?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
            </div>
            )}
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : !perfil ? (
            <p className="text-muted-foreground">Usuário não encontrado.</p>
          ) : (
            <>
              <div>
                <strong>Nome:</strong> {perfil.usernome}
              </div>
              <div>
                <strong>Email:</strong> {perfil.useremail}
              </div>
              <div>
                <strong>Tipo de Usuário:</strong> {perfil.tbltipousuarios?.descricaotipo || "—"}
              </div>
              <div>
                <strong>Grupo:</strong> {perfil.tblgrupousuarios?.gruponame || "—"}
              </div>
              {perfil.tblusuariofuncionario?.tblfuncionarios && (
                <>
                  <hr />
                  <p className="text-sm text-muted-foreground">Informações do Funcionário:</p>
                  <div>
                    <strong>Nome:</strong> {perfil.tblusuariofuncionario.tblfuncionarios.funcionarionome}
                  </div>
                  <div>
                    <strong>Email Corporativo:</strong> {perfil.tblusuariofuncionario.tblfuncionarios.funcionarioemail}
                  </div>
                  <div>
                    <strong>Função:</strong> {perfil.tblusuariofuncionario.tblfuncionarios.funcaotipoid}
                  </div>
                  <div>
                    <strong>Categoria:</strong> {perfil.tblusuariofuncionario.tblfuncionarios.categoriaid}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PerfilUsuario;


