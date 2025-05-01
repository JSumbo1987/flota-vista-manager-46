import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface TipoUsuario {
  tipousuarioid: string;
  descricao: string;
}

interface GrupoUsuario {
  grupousuarioid: string;
  nome: string;
}

const AddUsuario = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    usernome: "",
    useremail: "",
    userpassword: "",
    tipousuarioid: "",
    grupousuarioid: "",
    issuperusuario: false,
  });

  const [tiposUsuario, setTiposUsuario] = useState<TipoUsuario[]>([]);
  const [gruposUsuario, setGruposUsuario] = useState<GrupoUsuario[]>([]);
  const [superUsuarioExiste, setSuperUsuarioExiste] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: tipos } = await supabase.from("tbltipousuarios").select("*");
      setTiposUsuario(tipos || []);

      const { data: grupos } = await supabase.from("tblgrupousuarios").select("*");
      setGruposUsuario(grupos || []);

      const { count } = await supabase
        .from("tblusuarios")
        .select("*", { count: "exact", head: true })
        .eq("issuperusuario", true);

      setSuperUsuarioExiste((count || 0) > 0);
    }

    fetchData();
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const email = form.useremail.trim().toLowerCase();

      const [{ count: usuarioCount }, { count: funcionarioCount }] = await Promise.all([
        supabase.from("tblusuarios").select("*", { count: "exact", head: true }).eq("useremail", email),
        supabase.from("tblfuncionarios").select("*", { count: "exact", head: true }).eq("funcionarioemail", email),
      ]);

      if ((usuarioCount || 0) > 0 || (funcionarioCount || 0) > 0) {
        toast({ title: "Ops", description: "O e-mail informado já existe cadastrado no sistema!", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("tblusuarios").insert({
        usernome: form.usernome,
        useremail: email,
        userpassword: form.userpassword, // Hash se necessário
        tipousuarioid: form.tipousuarioid,
        grupousuarioid: form.grupousuarioid,
        estado: "activo",
        useremailconfirmed: false,
        isfastlogin: 0,
        issuperusuario: form.issuperusuario,
      });

      if (error) throw error;

      toast({ title: "Usuário cadastrado com sucesso!" });
      navigate("/usuarios");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao cadastrar usuário", description: String(err), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/usuarios")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Adicionar Usuário</h2>
          <p className="text-muted-foreground">Crie uma nova conta de usuário</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome*</Label>
              <Input name="usernome" value={form.usernome} onChange={handleChange} required />
            </div>
            <div>
              <Label>Email*</Label>
              <Input type="email" name="useremail" value={form.useremail} onChange={handleChange} required />
            </div>
            <div>
              <Label>Senha*</Label>
              <Input type="password" name="userpassword" value={form.userpassword} onChange={handleChange} required />
            </div>
            <div>
              <Label>Tipo de Usuário*</Label>
              <select
                name="tipousuarioid"
                value={form.tipousuarioid}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione</option>
                {tiposUsuario.map((tipo) => (
                  <option key={tipo.tipoid} value={tipo.tipoid}>
                    {tipo.descricaotipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Grupo de Usuário*</Label>
              <select
                name="grupousuarioid"
                value={form.grupousuarioid}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione</option>
                {gruposUsuario.map((grupo) => (
                  <option key={grupo.grupoid} value={grupo.grupoid}>
                    {grupo.gruponame}
                  </option>
                ))}
              </select>
            </div>
            {!superUsuarioExiste && (
              <div className="col-span-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="issuperusuario"
                  checked={form.issuperusuario}
                  onChange={handleChange}
                />
                <Label>Super Usuário</Label>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/usuarios")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Usuário"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddUsuario;
