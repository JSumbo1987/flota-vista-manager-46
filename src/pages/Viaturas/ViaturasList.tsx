import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Viatura {
  viaturaId: number;
  viaturaMarca: string;
  viaturaModelo: string;
  viaturaMatricula: string;
  viaturaAnoFabrica: string;
  viaturaCombustivel: string;
  viaturaCor: string;
  quilometragem: string;
  viaturaTipo: {
    nome: string;
  };
  viaturaCategoria: {
    nome: string;
  };
}

const ViaturaList = () => {
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchViaturas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("Viatura")
        .select(`
          viaturaId,
          viaturaMarca,
          viaturaModelo,
          viaturaMatricula,
          viaturaAnoFabrica,
          viaturaCombustivel,
          viaturaCor,
          quilometragem,
          viaturaTipo (
            nome
          ),
          viaturaCategoria (
            nome
          )
        `);

      setLoading(false);

      if (error) {
        toast({
          title: "Erro ao carregar viaturas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setViaturas(data || []);
    };

    fetchViaturas();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta viatura?")) return;

    const { error } = await supabase.from("Viatura").delete().eq("viaturaId", id);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Viatura excluída com sucesso",
    });

    setViaturas((prev) => prev.filter((v) => v.viaturaId !== id));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Viaturas</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Marca</th>
              <th className="border p-2 text-left">Modelo</th>
              <th className="border p-2 text-left">Matrícula</th>
              <th className="border p-2 text-left">Ano</th>
              <th className="border p-2 text-left">Combustível</th>
              <th className="border p-2 text-left">Cor</th>
              <th className="border p-2 text-left">Quilometragem</th>
              <th className="border p-2 text-left">Tipo</th>
              <th className="border p-2 text-left">Categoria</th>
              <th className="border p-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {viaturas.map((viatura) => (
              <tr key={viatura.viaturaId} className="hover:bg-gray-100">
                <td className="border p-2">{viatura.viaturaMarca}</td>
                <td className="border p-2">{viatura.viaturaModelo}</td>
                <td className="border p-2">{viatura.viaturaMatricula}</td>
                <td className="border p-2">{viatura.viaturaAnoFabrica}</td>
                <td className="border p-2">{viatura.viaturaCombustivel}</td>
                <td className="border p-2">{viatura.viaturaCor}</td>
                <td className="border p-2">{viatura.quilometragem}</td>
                <td className="border p-2">{viatura.viaturaTipo?.nome}</td>
                <td className="border p-2">{viatura.viaturaCategoria?.nome}</td>
                <td className="border p-2 text-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/viaturas/editar/${viatura.viaturaId}`)}
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(viatura.viaturaId)}
                    title="Excluir"
                  >
                    <Trash size={16} />
                  </Button>
                </td>
              </tr>
            ))}
            {viaturas.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center p-4">
                  Nenhuma viatura encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViaturaList;