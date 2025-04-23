import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient"; // ajustar para o caminho real do seu client

const funcoes = [
  { id: "MOTORISTA", nome: "Motorista" },
  { id: "AUXILIAR", nome: "Auxiliar" },
];

const categorias = [
  { id: "B", nome: "Categoria B" },
  { id: "D", nome: "Categoria D" },
];

const nacionalidades = [
  { id: "AO", nome: "Angolana" },
  { id: "PT", nome: "Portuguesa" },
];

const EditarFuncionario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
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
    estado: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFuncionario = async () => {
      const { data, error } = await supabase
        .from("Funcionario")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "Erro ao buscar funcionário",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setForm(data);
    };

    fetchFuncionario();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const { error } = await supabase
      .from("Funcionario")
      .update(form)
      .eq("id", id);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao atualizar funcionário",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Funcionário atualizado",
        description: "Dados salvos com sucesso!",
      });
      navigate("/funcionarios");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/funcionarios")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Editar Funcionário</h2>
          <p className="text-muted-foreground">Atualize os dados do funcionário</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados do Funcionário</CardTitle>
            <CardDescription>Atualize os campos abaixo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input name="funcionarioNome" value={form.funcionarioNome} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Número do BI</Label>
                <Input name="numeroBI" value={form.numeroBI} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input name="funcionarioTelefone" value={form.funcionarioTelefone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="funcionarioEmail" value={form.funcionarioEmail} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Gênero</Label>
                <select name="genero" value={form.genero} onChange={handleChange} className="w-full p-2 border rounded">
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Província</Label>
                <Input name="provincia" value={form.provincia} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Nacionalidade</Label>
                <select name="nacionalidade" value={form.nacionalidade} onChange={handleChange} className="w-full p-2 border rounded">
                  <option value="">Selecione</option>
                  {nacionalidades.map((n) => (
                    <option key={n.id} value={n.id}>{n.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <select name="funcaoTipoId" value={form.funcaoTipoId} onChange={handleChange} className="w-full p-2 border rounded">
                  <option value="">Selecione</option>
                  {funcoes.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Categoria da Carta</Label>
                <select name="categoriaId" value={form.categoriaId} onChange={handleChange} className="w-full p-2 border rounded">
                  <option value="">Selecione</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Número da Carta</Label>
                <Input name="CartaDeConducaoNr" value={form.CartaDeConducaoNr} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input type="date" name="DataEmissao" value={form.DataEmissao?.split("T")[0] || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input type="date" name="DataValidade" value={form.DataValidade?.split("T")[0] || ""} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/funcionarios")}>
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

export default EditarFuncionario;