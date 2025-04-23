import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Mock data
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

const AddFuncionario = () => {
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
    estado: "Activo",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.funcionarioNome || !form.numeroBI || !form.nacionalidade || !form.funcaoTipoId) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Enviar dados para Supabase
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Funcionário adicionado",
          description: "O funcionário foi registrado com sucesso.",
        });
        navigate("/funcionarios");
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro",
        description: "Erro ao adicionar funcionário.",
        variant: "destructive",
      });
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
            <CardTitle>Dados do Funcionário</CardTitle>
            <CardDescription>Preencha os campos abaixo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome*</Label>
                <Input name="funcionarioNome" value={form.funcionarioNome} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Número do BI*</Label>
                <Input name="numeroBI" value={form.numeroBI} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Telefone*</Label>
                <Input name="funcionarioTelefone" value={form.funcionarioTelefone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="funcionarioEmail" value={form.funcionarioEmail} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Gênero*</Label>
                <select name="genero" value={form.genero} onChange={handleChange} className="w-full p-2 border rounded">
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Província*</Label>
                <Input name="provincia" value={form.provincia} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Nacionalidade*</Label>
                <select name="nacionalidade" value={form.nacionalidade} onChange={handleChange} className="w-full p-2 border rounded">
                  <option value="">Selecione</option>
                  {nacionalidades.map((n) => (
                    <option key={n.id} value={n.id}>{n.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Função*</Label>
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
                <Input type="date" name="DataEmissao" value={form.DataEmissao} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input type="date" name="DataValidade" value={form.DataValidade} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
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