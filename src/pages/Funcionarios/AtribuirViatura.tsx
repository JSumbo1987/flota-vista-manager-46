import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AtribuirViatura = () => {
  const { funcionarioid } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [funcionario, setFuncionario] = useState<any>(null);
  const [viatura, setViatura] = useState<any>(null);
  const [matriculaBusca, setMatriculaBusca] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFuncionario = async () => {
      if (!funcionarioid) return;

      const { data, error } = await supabase
        .from("tblfuncionarios")
        .select("funcionarioid, funcionarionome, funcionarioemail, cartadeconducaonr, datavalidade")
        .eq("funcionarioid", funcionarioid)
        .single();
      if (!error && data) setFuncionario(data);
    };

    fetchFuncionario();
  }, [funcionarioid]);

  const handleBuscarViatura = async () => {
    const { data, error } = await supabase
      .from("tblviaturas")
      .select("viaturaid, viaturamarca, viaturamatricula, viaturamodelo")
      .ilike("viaturamatricula", `%${matriculaBusca}%`)
      .single();

    if (!error && data) setViatura(data);
    else {
      setViatura(null);
      toast({ title: "Viatura não encontrada", variant: "destructive" });
    }
  };

  const handleVincular = async () => {
    if (!funcionario || !viatura) return;
    setIsSubmitting(true);

    const { data: existeVinculo } = await supabase
      .from("tblfuncionarioviatura")
      .select("*")
      .or(`viaturaid.eq.${viatura.viaturaid},funcionarioid.eq.${funcionario.funcionarioid}`);

    if (existeVinculo && existeVinculo.length > 0) {
      toast({ title: "Ops", description: "A viatura já está atribuída ou o funcionário já possui viatura", variant: "destructive" });
    } else {
      const { error } = await supabase
        .from("tblfuncionarioviatura")
        .insert({
          funcionarioid: funcionario.funcionarioid,
          viaturaid: viatura.viaturaid,
        });

      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Viatura atribuída com sucesso!" });
        navigate("/funcionarios");
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Atribuir Viatura</h2>
          <p className="text-muted-foreground">Vincule uma viatura a um funcionário</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Funcionário</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <Input value={funcionario?.funcionarionome || ""} disabled />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={funcionario?.funcionarioemail || ""} disabled />
          </div>
          <div>
            <Label>Carta de Condução Nº</Label>
            <Input value={funcionario?.cartadeconducaonr || ""} disabled />
          </div>
          <div>
            <Label>Validade</Label>
            <Input value={funcionario?.datavalidade || ""} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Viatura</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Pesquisar por Matrícula</Label>
            <div className="flex gap-2">
              <Input value={matriculaBusca} onChange={(e) => setMatriculaBusca(e.target.value)} />
              <Button type="button" onClick={handleBuscarViatura}>Buscar</Button>
            </div>
          </div>
          <div>
            <Label>Viatura</Label>
            <Input value={viatura?.viaturamarca+" "+viatura?.viaturamodelo || ""} disabled />
          </div>
          <div>
            <Label>Matrícula</Label>
            <Input value={viatura?.viaturamatricula || ""} disabled />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="button" disabled={!viatura || !funcionario || isSubmitting} onClick={handleVincular}>
            {isSubmitting ? "Vinculando..." : "Vincular Viatura"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AtribuirViatura;
