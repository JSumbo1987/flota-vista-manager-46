import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface FuncaoTipo {
  funcaoid: string;
}

interface Categoria {
  categoriaid: string;
}

interface Nacionalidade {
  nacionalidadeid: string;
}

const initialState = {
  funcionarioNome: "",
  numeroBI: "",
  nacionalidade: "",
  genero: "",
  provincia: "",
  funcionarioEmail: "",
  funcionarioTelefone: "",
  CartaDeConducaoNr: "",
  DataEmissao: "",
  DataValidade: "",
  categoriaId: "",
  funcaoTipoId: "",
  estado: "Activo",
};

const AddFuncionario = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [funcoes, setFuncoes] = useState<FuncaoTipo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nacionalidades, setNacionalidades] = useState<Nacionalidade[]>([]);
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState({
    copiabi: null as File | null,
    copiacartaconducao: null as File | null,
    copialicencaconducao: null as File | null,
    fotografia: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: funcoesData } = await supabase
        .from("tblfuncaotipo")
        .select("funcaoid");
      setFuncoes(funcoesData || []);

      const { data: categoriasData } = await supabase
        .from("tblcategorias")
        .select("categoriaid");
      setCategorias(categoriasData || []);

      const { data: nacionalidadesData } = await supabase
        .from("tblnacionalidades")
        .select("nacionalidadeid");
      setNacionalidades(nacionalidadesData || []);
    }
    fetchData();
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, files: fileList } = e.target;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setFiles((prev) => ({ ...prev, [name]: file }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const uploadFile = async (file: File, pathPrefix: string) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${pathPrefix}-${Date.now()}.${fileExt}`;
        const filePath = `${pathPrefix}/${fileName}`;

        const { error } = await supabase.storage
          .from("funcionarios")
          .upload(filePath, file, { upsert: true });

        if (error) throw error;
        return filePath;
      };

      const email = form.funcionarioEmail.trim().toLowerCase();//Para Verificação no sistema.
      const numeroCarta = form.CartaDeConducaoNr.trim().toUpperCase();//Para Verificação no sistema.
      const copiaBIUrl = files.copiabi ? await uploadFile(files.copiabi, "copiaBI") : null;
      const copiaCartaConducaoUrl = files.copiacartaconducao ? await uploadFile(files.copiacartaconducao, "cartaConducao") : null;
      const copiaLicencaConducaoUrl = files.copialicencaconducao ? await uploadFile(files.copialicencaconducao, "licencaConducao") : null;
      const fotografiaUrl = files.fotografia ? await uploadFile(files.fotografia, "fotografia") : null;

      const [{ count: usuarioCount }, { count: funcionarioCount }, { count: numeroCartaCount }] = await Promise.all([
        supabase.from("tblusuarios").select("*", { count: "exact", head: true }).eq("useremail", email),
        supabase.from("tblfuncionarios").select("*", { count: "exact", head: true }).eq("funcionarioemail", email),
        supabase.from("tblfuncionarios").select("*", { count: "exact", head: true }).eq("cartadeconducaonr", numeroCarta),
      ]);

      if ((usuarioCount || 0) > 0 || (funcionarioCount || 0) > 0) {
        toast({ title: "Ops", description: "O e-mail informado já existe cadastrado no sistema!", variant: "destructive" });
        return;
      }

      if ((numeroCartaCount || 0) > 0) {
        toast({ title: "Ops", description: "O número da carta de condução já existe cadastrado no sistema!", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("tblfuncionarios").insert({
        funcionarionome: form.funcionarioNome.trim().toUpperCase(),
        numerobi: form.numeroBI.trim().toUpperCase(),
        nacionalidade: form.nacionalidade.trim().toUpperCase(),
        genero: form.genero.trim().toUpperCase(),
        provincia: form.provincia.trim().toUpperCase(),
        funcionarioemail: form.funcionarioEmail,
        funcionariotelefone: form.funcionarioTelefone,
        cartadeconducaonr: form.CartaDeConducaoNr.trim().toUpperCase(),
        dataemissao: form.DataEmissao,
        datavalidade: form.DataValidade,
        funcaotipoid: form.funcaoTipoId.trim().toUpperCase(),
        categoriaid: form.categoriaId.trim().toUpperCase(),
        copiabi: copiaBIUrl,
        copiacartaconducao: copiaCartaConducaoUrl,
        copialicencaconducao: copiaLicencaConducaoUrl,
        fotografia: fotografiaUrl,
        estado: form.estado,
      });

      if (error) throw error;

      toast({ title: "Funcionário salvo com sucesso!" });
      setForm(initialState);
      setFiles({
        copiabi: null,
        copiacartaconducao: null,
        copialicencaconducao: null,
        fotografia: null,
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar funcionário", description: String(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/funcionarios")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Adicionar Funcionário</h2>
          <p className="text-muted-foreground">Registre um novo funcionário</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Funcionário</CardTitle>
            <CardDescription>Organizado por abas para melhor visualização</CardDescription>
          </CardHeader>
          <Tabs defaultValue="dados" className="px-6">
            <TabsList className="mb-4">
              <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome*</Label>
                <Input name="funcionarioNome" value={form.funcionarioNome} onChange={handleChange} required />
              </div>
              <div>
                <Label>Número do BI*</Label>
                <Input name="numeroBI" value={form.numeroBI} onChange={handleChange} required />
              </div>
              <div>
                <Label>Telefone*</Label>
                <Input name="funcionarioTelefone" value={form.funcionarioTelefone} onChange={handleChange} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="funcionarioEmail" type="email" value={form.funcionarioEmail} onChange={handleChange} />
              </div>
              <div>
                <Label>Gênero*</Label>
                <select name="genero" value={form.genero} onChange={handleChange} className="w-full p-2 border rounded" required>
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              <div>
                <Label>Província*</Label>
                <Input name="provincia" value={form.provincia} onChange={handleChange} required />
              </div>
              <div>
                <Label>Nacionalidade*</Label>
                <select name="nacionalidade" value={form.nacionalidade} onChange={handleChange} className="w-full p-2 border rounded" required>
                  <option value="">Selecione</option>
                  {nacionalidades.map((n) => (
                    <option key={n.nacionalidadeid} value={n.nacionalidadeid}>{n.nacionalidadeid}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Função*</Label>
                <select name="funcaoTipoId" value={form.funcaoTipoId} onChange={handleChange} className="w-full p-2 border rounded" required>
                  <option value="">Selecione</option>
                  {funcoes.map((f) => (
                    <option key={f.funcaoid} value={f.funcaoid}>{f.funcaoid}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Categoria*</Label>
                <select name="categoriaId" value={form.categoriaId} onChange={handleChange} className="w-full p-2 border rounded">
                  <option value="">Selecione</option>
                  {categorias.map((c) => (
                    <option key={c.categoriaid} value={c.categoriaid}>{c.categoriaid}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Número da Carta de Condução</Label>
                <Input name="CartaDeConducaoNr" value={form.CartaDeConducaoNr} onChange={handleChange} />
              </div>
              <div>
                <Label>Data de Emissão</Label>
                <Input name="DataEmissao" type="date" value={form.DataEmissao} onChange={handleChange} />
              </div>
              <div>
                <Label>Data de Validade</Label>
                <Input name="DataValidade" type="date" value={form.DataValidade} onChange={handleChange} />
              </div>
            </TabsContent>

            <TabsContent value="documentos" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Cópia do BI</Label>
                <Input type="file" name="copiabi" onChange={handleFileChange} />
              </div>
              <div>
                <Label>Carta de Condução</Label>
                <Input type="file" name="copiacartaconducao" onChange={handleFileChange} />
              </div>
              <div>
                <Label>Licença de Condução</Label>
                <Input type="file" name="copialicencaconducao" onChange={handleFileChange} />
              </div>
              <div>
                <Label>Fotografia</Label>
                <Input type="file" name="fotografia" onChange={handleFileChange} />
              </div>
            </TabsContent>
          </Tabs>
          <br/>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/funcionarios")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Funcionário"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddFuncionario;

