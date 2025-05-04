import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { gerarHashSenha } from "@/hooks/GerarHashSenha";
import { useSenhaValidator } from "@/hooks/useSenhaValidator";

interface TipoUsuario {
  tipoid: string;
  descricaotipo: string;
}

interface GrupoUsuario {
  grupoid: string;
  gruponame: string;
}

const AddUsuario = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    usernome: "",
    useremail: "",
    userpassword: "",
    tipoid: "",
    grupoid: "",
    issuperusuario: false,
  });

  const [tiposUsuario, setTiposUsuario] = useState<TipoUsuario[]>([]);
  const [gruposUsuario, setGruposUsuario] = useState<GrupoUsuario[]>([]);
  const [superUsuarioExiste, setSuperUsuarioExiste] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { erro: senhaErro, validar: validarSenha } = useSenhaValidator();

  useEffect(() => {
    async function fetchData() {
      try {
        const [tiposResponse, gruposResponse, superResponse] = await Promise.all([
          supabase.from("tbltipousuarios").select("*"),
          supabase.from("tblgrupousuarios").select("*"),
          supabase.from("tblusuarios").select("*", { count: "exact", head: true }).eq("issuperusuario", true)
        ]);

        setTiposUsuario((tiposResponse.data || []).map((item) => ({
          ...item,
          tipoid: String(item.tipoid),
        })));
        
        setGruposUsuario((gruposResponse.data || []).map((item) => ({
          ...item,
          grupoid: String(item.grupoid),
        })));
        
        setSuperUsuarioExiste((superResponse.count || 0) > 0);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações necessárias",
          variant: "destructive",
        });
      }
    }

    fetchData();
  }, [toast]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  
    if (name === "userpassword") { validarSenha(value); }
  };
  

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, issuperusuario: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const email = form.useremail.trim().toLowerCase();

      const [usuarioResponse, funcionarioResponse] = await Promise.all([
        supabase.from("tblusuarios").select("*", { count: "exact", head: true }).eq("useremail", email),
        supabase.from("tblfuncionarios").select("*", { count: "exact", head: true }).eq("funcionarioemail", email),
      ]);

      if ((usuarioResponse.count || 0) > 0 || (funcionarioResponse.count || 0) > 0) {
        toast({ 
          title: "Ops", 
          description: "O e-mail informado já existe cadastrado no sistema!", 
          variant: "destructive" 
        });
        setIsSubmitting(false);
        return;
      }

      const senhaHash = await gerarHashSenha(form.userpassword);
      const { error } = await supabase.from("tblusuarios").insert({
        usernome: form.usernome,
        useremail: form.useremail,
        userpassword: senhaHash.trim(),
        tipousuarioid: form.tipoid,
        grupousuarioid: form.grupoid,
        estado: "activo",
        useremailconfirmed: false,
        isfastlogin: 0,
        issuperusuario: form.issuperusuario,
      });

      if (error) throw error;

      toast({ title: "Usuário cadastrado com sucesso!" });
      //Enviar email para confirmar o e-mail do Usuário.

      navigate("/usuarios");
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Erro ao cadastrar usuário", 
        description: String(err), 
        variant: "destructive" 
      });
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
            <div className="space-y-2">
              <Label htmlFor="usernome">Nome Completo*</Label>
              <Input 
                id="usernome"
                name="usernome" 
                value={form.usernome} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="useremail">Email*</Label>
              <Input 
                id="useremail"
                type="email" 
                name="useremail" 
                value={form.useremail} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userpassword">Senha*</Label>
              <Input 
                id="userpassword"
                type="password" 
                name="userpassword" 
                value={form.userpassword} 
                onChange={handleInputChange} 
                required 
              />
              {senhaErro && ( <p className="text-sm text-red-500">{senhaErro}</p> )}
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
            {!superUsuarioExiste && (
              <div className="col-span-2 flex items-center space-x-2">
                <Switch 
                  id="issuperusuario"
                  checked={form.issuperusuario}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="issuperusuario">Super Usuário</Label>
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


