import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { gerarHashSenha } from "@/hooks/GerarHashSenha";
import { useSenhaValidator } from "@/hooks/useSenhaValidator";

interface TipoUsuario {
  tipoid: number;
  descricaotipo: string;
}

interface GrupoUsuario {
  grupoid: number;
  gruponame: string;
}

interface Usuario {
  userid: string;
  usernome: string;
  useremail: string;
  tipousuarioid: number;
  grupousuarioid: number;
  issuperusuario: boolean;
  estado: string;
  useremailconfirmed: boolean;
  isfastlogin: number;
  userreceberemail: boolean,
}

const EditUsuario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState<Usuario>({
    userid: "", usernome: "", useremail: "", tipousuarioid: 0, grupousuarioid: 0,
    issuperusuario: false, estado: "activo", useremailconfirmed: false, isfastlogin: 0,
    userreceberemail: false,
  });

  const [tiposUsuario, setTiposUsuario] = useState<TipoUsuario[]>([]);
  const [gruposUsuario, setGruposUsuario] = useState<GrupoUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anyOtherSuperUser, setAnyOtherSuperUser] = useState(false);
  const { erro: senhaErro, validar: validarSenha } = useSenhaValidator();

  useEffect(()=>{
    fetchTiposEGruposUsuarios();
  },[]);

  const fetchTiposEGruposUsuarios = async () => {
    try {
      const [tiposRes, gruposRes] = await Promise.all([
        supabase.from("tbltipousuarios").select("*"),
        supabase.from("tblgrupousuarios").select("*")
      ]);
  
      if (tiposRes.error || gruposRes.error) {
        throw new Error(
          tiposRes.error?.message || gruposRes.error?.message || "Erro ao buscar tipos e grupos"
        );
      }
  
      return {
        tipos: tiposRes.data || [],
        grupos: gruposRes.data || [],
      };
    } catch (error) {
      throw new Error(`Erro ao buscar tipos e grupos: ${String(error)}`);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchUsuarioData(id);
  }, [id]);

  const fetchUsuarioData = async (userId: string) => {
  try {
    setIsLoading(true);

    const { tipos, grupos } = await fetchTiposEGruposUsuarios();

    setTiposUsuario(tipos);
    setGruposUsuario(grupos);

    
    const { data: usuarioData, error: usuarioError } = await supabase
    .from("tblusuarios")
    .select("*")
    .eq("userid", userId)
    .single();
    
    if (usuarioError || !usuarioData) {
      throw new Error(usuarioError?.message || "Usuário não encontrado");
    }

    setForm({ ...usuarioData, estado: usuarioData.estado ?? "activo" });

    if (usuarioData.issuperusuario) {
      const { count } = await supabase
        .from("tblusuarios")
        .select("*", { count: "exact", head: true })
        .eq("issuperusuario", true)
        .neq("userid", userId);

      setAnyOtherSuperUser((count || 0) > 0);
    }
  } catch (error) {
    toast({ title: "Erro ao carregar dados", description: String(error), variant: "destructive" });
    navigate("/usuarios");
  } finally {
    setIsLoading(false);
  }
  };

  const verificarDuplicidadeEmail = async (email: string) => {
    const [usuarioRes, funcionarioRes] = await Promise.all([
      supabase.from("tblusuarios").select("*", { count: "exact", head: true }).eq("useremail", email).neq("userid", id),
      supabase.from("tblfuncionarios").select("*", { count: "exact", head: true }).eq("funcionarioemail", email)
    ]);
    return (usuarioRes.count || 0) > 0 || (funcionarioRes.count || 0) > 0;
  };

  const atualizarUsuario = async () => {
    const email = form.useremail.trim().toLowerCase();

    if (await verificarDuplicidadeEmail(email)) {
      toast({ title: "Ops", description: "O e-mail informado já existe cadastrado no sistema!", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("tblusuarios").update({
      usernome: form.usernome,
      useremail: email,
      tipoid: form.tipoid,
      grupoid: form.grupoid,
      estado: form.estado,
      issuperusuario: form.issuperusuario,
      userreceberemail:form.userreceberemail
    }).eq("userid", id);

    if (error) throw error;

    toast({ title: `Usuário ${form.usernome} atualizado com sucesso!` });
    navigate("/usuarios");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      await atualizarUsuario();
    } catch (err) {
      toast({ title: "Erro ao atualizar usuário", description: String(err), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name: keyof Usuario, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    //if (name === "userpassword") { validarSenha(value); }
  };

  const handleSwitchChangeNotificacao = (checked: boolean) => {
    setForm((prev) => ({ ...prev, userreceberemail: checked }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/usuarios")} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/usuarios")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Editar Usuário</h2>
          <p className="text-muted-foreground">Atualize os dados do usuário</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader><CardTitle>Informações do Usuário</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usernome">Nome*</Label>
              <Input id="usernome" value={form.usernome} onChange={(e) => handleChange("usernome", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="useremail">Email*</Label>
              <Input id="useremail" type="email" value={form.useremail} onChange={(e) => handleChange("useremail", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Usuário*</Label>
              <Select value={form.tipousuarioid?.toString() ?? ""} 
                onValueChange={(v) => handleChange("tipousuarioid", parseInt(v))}>
                <SelectTrigger><SelectValue placeholder={tiposUsuario.length === 0 ? "Carregando..." : "Selecione o tipo"} /></SelectTrigger>
                <SelectContent>
                  {tiposUsuario.map((tipo) => (
                    <SelectItem key={tipo.tipoid} value={tipo.tipoid.toString()}>{tipo.descricaotipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grupo de Usuário*</Label>
              <Select
                value={form.grupousuarioid?.toString() ?? ""}
                onValueChange={(v) => handleChange("grupousuarioid", parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={gruposUsuario.length === 0 ? "Carregando..." : "Selecione o grupo"} />
                </SelectTrigger>
                <SelectContent>
                  {gruposUsuario.map((grupo) => (
                    <SelectItem key={grupo.grupoid} value={grupo.grupoid.toString()}>
                      {grupo.gruponame}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => handleChange("estado", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Ativo</SelectItem>
                  <SelectItem value="inactivo">Inativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!setAnyOtherSuperUser && (
            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="issuperusuario"
                checked={form.issuperusuario}
                onCheckedChange={(v) => handleChange("issuperusuario", v)}
                disabled={form.issuperusuario && !anyOtherSuperUser}
              />
              <Label htmlFor="issuperusuario">Super Usuário</Label>
              {form.issuperusuario && !anyOtherSuperUser && (
                <span className="text-sm text-muted-foreground ml-2">(Este é o único Super Usuário)</span>
              )}
            </div>)}
            <div className="col-span-2 flex items-center space-x-2">
              <Switch 
                id="userreceberemail"
                checked={form.userreceberemail}
                onCheckedChange={handleSwitchChangeNotificacao}
              />
              <Label htmlFor="userreceberemail">Receber Notificação por e-mail?</Label>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/usuarios")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditUsuario;






