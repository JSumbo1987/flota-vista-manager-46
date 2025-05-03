import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft } from "lucide-react";

const AtribuirViatura = () => {
  const { funcionarioid } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [funcionario, setFuncionario] = useState(null);
  const [viaturasEncontradas, setViaturasEncontradas] = useState([]);
  const [selectedViaturaId, setSelectedViaturaId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viaturaJaAtribuida, setViaturaJaAtribuida] = useState(false);
  const [funcionarioJaTemViatura, setFuncionarioJaTemViatura] = useState(false);



  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        const [{ data: funcionarioData, error: funcionarioError }] = await Promise.all([
          supabase
            .from("tblfuncionarios")
            .select("*")
            .eq("funcionarioid", funcionarioid)
            .single(),
        ]);

        if (funcionarioError) throw funcionarioError;
        setFuncionario(funcionarioData);

        // Verifica se já tem viatura atribuída
        await verificarFuncionarioComViatura(funcionarioid);
      } catch (error) {
        toast({
          title: "Erro",
          description: `Erro ao carregar dados: ${error.message}`,
          variant: "destructive"
        });
        navigate("/funcionarios");
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [funcionarioid, navigate, toast]);

  const pesquisarViaturaPorMatricula = async (matricula) => {
    if (!matricula || matricula.length < 7) {
      setViaturasEncontradas([]);
      return;
    }
  
    const { data, error } = await supabase
      .from("tblviaturas")
      .select("*")
      .ilike("viaturamatricula", `%${matricula}%`);
  
    if (error) {
      setViaturasEncontradas([]);
      return;
    }
  
    setViaturasEncontradas(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedViaturaId) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione uma viatura para continuar.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
      .from("tblfuncionarioviatura")
      .insert({ funcionarioid, viaturaid: selectedViaturaId });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Viatura atribuída com sucesso."
      });
      navigate("/funcionarios");
    } catch (error) {
      console.log(error);
      toast({
        title: "Erro",
        description: `Erro ao atribuir viatura: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const verificarViaturaAtribuida = async (viaturaid) => {
    const { data, error } = await supabase
      .from("tblfuncionarioviatura")
      .select("*")
      .eq("viaturaid", viaturaid);
  
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar atribuição da viatura.",
        variant: "destructive"
      });
      return;
    }
  
    if (data.length > 0) {
      toast({
        title: "Viatura já atribuída",
        description: "Esta viatura já está atribuída a outro funcionário.",
        variant: "destructive"
      });
      setViaturaJaAtribuida(true);
      setSelectedViaturaId(""); // limpa seleção inválida
    } else {
      setViaturaJaAtribuida(false);
      setSelectedViaturaId(viaturaid);
    }
  };

  const verificarFuncionarioComViatura = async (funcionarioid) => {
    const { data, error } = await supabase
      .from("tblfuncionarioviatura")
      .select("*")
      .eq("funcionarioid", funcionarioid);
  
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar se o funcionário já possui viatura.",
        variant: "destructive"
      });
      return;
    }
  
    if (data.length > 0) {
      toast({
        title: "Funcionário já possui viatura",
        description: "Não é possível atribuir outra viatura a este funcionário.",
        variant: "destructive"
      });
      setFuncionarioJaTemViatura(true);
    } else {
      setFuncionarioJaTemViatura(false);
    }
  };
  
  

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/funcionarios")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Atribuir Viatura</h2>
          <p className="text-muted-foreground">Vincule uma viatura a um funcionário habilitado</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados do Funcionário</CardTitle>
            <CardDescription>Confirme as informações e selecione a viatura</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading ? (
              <p>Carregando informações...</p>
            ) : funcionario ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={funcionario.funcionarionome} readOnly />
                  </div>

                  <div>
                    <Label>Categoria</Label>
                    <Input value={funcionario.categoriaid || "Não informado"} readOnly />
                  </div>

                  <div>
                    <Label>Carta de Condução</Label>
                    <Input value={funcionario.cartadeconducaonr || "Não informado"} readOnly />
                  </div>
                </div>
                {funcionarioJaTemViatura && (
                  <Alert variant="destructive">
                    <AlertTitle>Funcionário já possui viatura atribuída</AlertTitle>
                    <AlertDescription>Não é possível atribuir outra viatura a este funcionário.</AlertDescription>
                  </Alert>
                )}
                {!funcionario.cartadeconducaonr ? (
                  <Alert variant="destructive">
                    <AlertTitle>Funcionário não habilitado</AlertTitle>
                    <AlertDescription>Sem carta de condução válida. Atribuição não permitida.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <Label>Pesquisar Viatura</Label>
                    <Input
                      placeholder="Digite a matrícula"
                      onChange={(e) => pesquisarViaturaPorMatricula(e.target.value)}
                      disabled={funcionarioJaTemViatura}
                    /><br/>
                    {!funcionarioJaTemViatura && viaturasEncontradas.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {viaturasEncontradas.map((viatura) => (
                        <Card
                          key={viatura.viaturaid}
                          className={`cursor-pointer border-2 p-2 text-sm h-auto ${
                            selectedViaturaId === viatura.viaturaid ? "border-blue-500" : "border-muted"
                          }`}
                          onClick={() => verificarViaturaAtribuida(viatura.viaturaid)}
                        >
                          <CardHeader>
                            <CardTitle>{viatura.viaturamatricula}</CardTitle>
                            <CardDescription>{viatura.viaturamarca} {viatura.viaturamodelo}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm text-muted-foreground">
                            <p><strong>Cor:</strong> {viatura.viaturacor}</p>
                            <p><strong>Ano:</strong> {viatura.viaturaanofabrica}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  </div>
                )}
              </>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>Não foi possível carregar os dados do funcionário.</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate("/funcionarios")}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !funcionario?.cartadeconducaonr || funcionarioJaTemViatura}>
              {isSubmitting ? "Atribuindo..." : "Atribuir Viatura"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AtribuirViatura;
