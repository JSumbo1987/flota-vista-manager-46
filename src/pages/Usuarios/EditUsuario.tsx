import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface TipoUsuario {
  tipoid: string;
  descricaotipo: string;
}

interface GrupoUsuario {
  grupoid: string;
  gruponame: string;
}

interface Usuario {
  userid: string;
  usernome: string;
  useremail: string;
  tipoid: string;
  grupoid: string;
  issuperusuario: boolean;
  estado: string;
  useremailconfirmed: boolean;
  isfastlogin: number;
}

const EditUsuario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState<Usuario | null>(null);
  const [tiposUsuario, setTiposUsuario] = useState<TipoUsuario[]>([]);
  const [gruposUsuario, setGruposUsuario] = useState<GrupoUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anyOtherSuperUser, setAnyOtherSuperUser] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        setIsLoading(true);
        const [usuarioResponse, tiposResponse, gruposResponse] = await Promise.all([
          supabase.from("tblusuarios").select("*").eq("userid", id).single(),
          supabase.from("tbltipousuarios").select("*"),
          supabase.from("tblgrupousuarios").select("*"),
        ]);

        if (usuarioResponse.error || !usuarioResponse.data) {
          throw new Error(usuarioResponse.error?.message || "Usuário não encontrado");
        }

        setForm({
          ...usuarioResponse.data,
          tipoid: usuarioResponse.data.tipoid,
          grupoid: usuarioResponse.data.grupoid,
          estado: usuarioResponse.data.estado ?? "activo",
        });
        setTiposUsuario(tiposResponse.data || []);
        setGruposUsuario(gruposResponse.data || []);

        // Verifica se há outro superusuário
        if (usuarioResponse.data.issuperusuario) {
          const { count } = await supabase
            .from("tblusuarios")
            .select("*", { count: "exact", head: true })
            .eq("issuperusuario", true)
            .neq("userid", id);

          setAnyOtherSuperUser((count || 0) > 0);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: String(error),
          variant: "destructive",
        });
        navigate("/usuarios");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, navigate, toast]);

  const handleInputChange = (name: string, value: string) => {
    if (!form) return;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!form) return;
    setForm({ ...form, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    if (!form) return;
    setForm({ ...form, issuperusuario: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;

    setIsSubmitting(true);

    try {
      const email = form.useremail.trim().toLowerCase();

      const [usuarioResponse, funcionarioResponse] = await Promise.all([
        supabase
          .from("tblusuarios")
          .select("*", { count: "exact", head: true })
          .eq("useremail", email)
          .neq("userid", id),
        supabase
          .from("tblfuncionarios")
          .select("*", { count: "exact", head: true })
          .eq("funcionarioemail", email),
      ]);

      if ((usuarioResponse.count || 0) > 0 || (funcionarioResponse.count || 0) > 0) {
        toast({
          title: "Ops",
          description: "O e-mail informado já existe cadastrado no sistema!",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("tblusuarios")
        .update({
          usernome: form.usernome,
          useremail: email,
          tipoid: form.tipoid,
          grupoid: form.grupoid,
          estado: form.estado,
          issuperusuario: form.issuperusuario,
        })
        .eq("userid", id);

      if (error) throw error;

      toast({ title: "Usuário atualizado com sucesso!" });
      navigate("/usuarios");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao atualizar usuário",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/usuarios")} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Usuário não encontrado</h2>
          </div>
        </div>
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
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usernome">Nome*</Label>
              <Input
                id="usernome"
                value={form.usernome}
                onChange={(e) => handleInputChange("usernome", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="useremail">Email*</Label>
              <Input
                id="useremail"
                type="email"
                value={form.useremail}
                onChange={(e) => handleInputChange("useremail", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipousuarioid">Tipo de Usuário*</Label>
              <Select
                value={form.tipoid}
                onValueChange={(value) => handleSelectChange("tipoid", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {tiposUsuario.map((tipo) => (
                    <SelectItem key={tipo.tipoid} value={tipo.tipoid}>
                      {tipo.descricaotipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grupousuarioid">Grupo de Usuário*</Label>
              <Select
                value={form.grupoid}
                onValueChange={(value) => handleSelectChange("grupoid", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {gruposUsuario.map((grupo) => (
                    <SelectItem key={grupo.grupoid} value={grupo.grupoid}>
                      {grupo.gruponame}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(value) => handleSelectChange("estado", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Ativo</SelectItem>
                  <SelectItem value="inactivo">Inativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="issuperusuario"
                checked={form.issuperusuario}
                onCheckedChange={handleSwitchChange}
                disabled={form.issuperusuario && !anyOtherSuperUser}
              />
              <Label htmlFor="issuperusuario">Super Usuário</Label>
              {form.issuperusuario && !anyOtherSuperUser && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Este é o único Super Usuário)
                </span>
              )}
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




