
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';

const AtribuirViatura = () => {
  const { id } = useParams<{ id: string }>();
  const funcionarioId = id; // Use id from params
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [funcionario, setFuncionario] = useState(null);
  const [viaturas, setViaturas] = useState([]);
  const [selectedViaturaId, setSelectedViaturaId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFuncionario = async () => {
      if (!funcionarioId) {
        toast({
          title: "Erro",
          description: "ID do funcionário não especificado.",
          variant: "destructive",
        });
        navigate("/funcionarios");
        return;
      }

      try {
        const { data: funcionarioData, error: funcionarioError } = await supabase
          .from("tblfuncionarios")
          .select("*")
          .eq("id", funcionarioId)
          .single();

        if (funcionarioError) {
          throw funcionarioError;
        }

        setFuncionario(funcionarioData);
      } catch (error) {
        toast({
          title: "Erro",
          description: `Erro ao carregar dados do funcionário: ${error.message}`,
          variant: "destructive",
        });
        navigate("/funcionarios");
      }
    };

    const fetchViaturas = async () => {
      try {
        const { data: viaturasData, error: viaturasError } = await supabase
          .from("tblviaturas")
          .select("viaturaid, viaturamarca, viaturamodelo, viaturamatricula");

        if (viaturasError) {
          throw viaturasError;
        }

        setViaturas(viaturasData);
      } catch (error) {
        toast({
          title: "Erro",
          description: `Erro ao carregar viaturas: ${error.message}`,
          variant: "destructive",
        });
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFuncionario(), fetchViaturas()]);
      setIsLoading(false);
    };

    fetchData();
  }, [funcionarioId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedViaturaId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma viatura.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Associar a viatura ao funcionário na tabela de junção
      const { error: vincularError } = await supabase
        .from("tblfuncionariosviaturas")
        .insert([{
          funcionarioid: funcionarioId,
          viaturaid: selectedViaturaId,
        }]);

      if (vincularError) {
        throw vincularError;
      }

      toast({
        title: "Sucesso",
        description: "Viatura atribuída ao funcionário com sucesso!",
      });
      navigate("/funcionarios");
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao atribuir viatura: ${error.message}`,
        variant: "destructive",
      });
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
          <h2 className="text-3xl font-bold tracking-tight">Atribuir Viatura</h2>
          <p className="text-muted-foreground">
            Vincular uma viatura a um funcionário
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Funcionário</CardTitle>
            <CardDescription>Selecione a viatura a ser atribuída</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p>Carregando...</p>
            ) : funcionario ? (
              <>
                <div className="space-y-2">
                  <Label>Funcionário</Label>
                  <Input value={funcionario.funcionarionome} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Viatura</Label>
                  <Select value={selectedViaturaId} onValueChange={setSelectedViaturaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma viatura" />
                    </SelectTrigger>
                    <SelectContent>
                      {viaturas.map((viatura) => (
                        <SelectItem key={viatura.viaturaid} value={viatura.viaturaid}>
                          {viatura.viaturamarca} {viatura.viaturamodelo} ({viatura.viaturamatricula})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  Não foi possível carregar as informações do funcionário.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/funcionarios")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Atribuindo..." : "Atribuir Viatura"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AtribuirViatura;
