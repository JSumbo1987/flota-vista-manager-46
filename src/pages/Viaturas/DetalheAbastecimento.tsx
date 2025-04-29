import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

const DetalhesAbastecimento = () => {
  const navigate = useNavigate();
  const { viaturaId } = useParams<{ viaturaId: string }>();

  const [viatura, setViatura] = useState<any>(null);
  const [abastecimentos, setAbastecimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!viaturaId) return;

      setLoading(true);

      const { data: viaturaData } = await supabase
        .from("tblviaturas")
        .select("viaturaid, viaturamarca, viaturamodelo, viaturamatricula, viaturacombustivel")
        .eq("viaturaid", viaturaId)
        .single();

      const { data: abastecimentosData } = await supabase
        .from("tblabastecimentos")
        .select("*")
        .eq("viaturaid", viaturaId)
        .order("dataabastecimento", { ascending: false });

      setViatura(viaturaData);
      setAbastecimentos(abastecimentosData || []);
      setLoading(false);
    };

    fetchDetails();
  }, [viaturaId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!viatura) {
    return <div className="flex justify-center items-center h-64">Viatura não encontrada.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/viaturas")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Abastecimento</h2>
          <p className="text-muted-foreground">Informações da viatura e seus abastecimentos</p>
        </div>
      </div>

      {/* Informações da Viatura */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Viatura</CardTitle>
          <CardDescription>Dados principais da viatura</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Marca</Label>
            <div className="text-sm font-medium">{viatura.viaturamarca}</div>
          </div>
          <div className="space-y-1">
            <Label>Modelo</Label>
            <div className="text-sm font-medium">{viatura.viaturamodelo}</div>
          </div>
          <div className="space-y-1">
            <Label>Matrícula</Label>
            <div className="text-sm font-medium">{viatura.viaturamatricula}</div>
          </div>
          <div className="space-y-1">
            <Label>Combustível</Label>
            <div className="text-sm font-medium">{viatura.viaturacombustivel}</div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Abastecimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Registos de Abastecimentos</CardTitle>
          <CardDescription>Histórico de abastecimentos realizados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {abastecimentos.length === 0 ? (
            <div className="text-center text-muted-foreground">Nenhum abastecimento registrado para esta viatura.</div>
          ) : (
            abastecimentos.map((abastecimento) => (
              <div key={abastecimento.id} className="border rounded p-4 space-y-2">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div>
                    <Label>Data Abastecimento:</Label>{" "}
                    <span className="font-medium">
                      {new Date(abastecimento.dataabastecimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <Label>Litros:</Label>{" "}
                    <span className="font-medium">{abastecimento.litros} L</span>
                  </div>
                  <div>
                    <Label>Preço/Litro:</Label>{" "}
                    <span className="font-medium">{abastecimento.precolitro.toFixed(2)} </span>
                  </div>
                  <div>
                    <Label>Valor Total:</Label>{" "}
                    <span className="font-medium">{abastecimento.valortotal.toFixed(2)} </span>
                  </div>
                </div>
                <div>
                  <Label>Posto de Abastecimento:</Label>{" "}
                  <span className="font-medium">{abastecimento.postoabastecimento || "-"}</span>
                </div>
                <div>
                  <Label>Observações:</Label>{" "}
                  <span className="font-medium">{abastecimento.observacoes || "-"}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetalhesAbastecimento;
