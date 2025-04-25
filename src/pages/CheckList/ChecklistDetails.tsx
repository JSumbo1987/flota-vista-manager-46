import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
  } from "@/components/ui/tabs";  
import { ClipboardList, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Checklist {
  id: number;
  viatura: string;
  motorista: string;
  odometro: number;
  nivelcombustivel: string;
  condicaopneus: string;
  observacao: string;
  datachecklist: string;
  status: string;
  tblviaturas?: {
    viaturamarca: string;
    viaturamatricula: string;
  };
  tblfuncionarios?: {
    funcionarionome: string;
  };
}

interface ChecklistItem {
  id: number;
  checklistid: number;
  descricao: string;
  status: string;
}

export default function ChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: checklistData, error: checklistError } = await supabase
        .from("tblchecklist")
        .select(
          `*,
          tblfuncionarios:motoristaid(funcionarionome),
          tblviaturas:viaturaid(viaturamarca, viaturamatricula)`
        )
        .eq("id", Number(id))
        .single();

      if (checklistError) {
        toast({ title: "Erro ao carregar checklist", description: checklistError.message });
        setLoading(false);
        return;
      }

      setChecklist(checklistData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("tblchecklistitem")
        .select("*")
        .eq("checklistid", Number(id));

      if (itemsError) {
        toast({ title: "Erro ao carregar itens", description: itemsError.message });
        setLoading(false);
        return;
      }

      setItems(itemsData || []);
      setLoading(false);
    };

    fetchData();
  }, [id, toast]);

  if (loading) return <p>Carregando detalhes...</p>;
  if (!checklist) return <p>Checklist não encontrado.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => navigate(-1)}
        aria-label="Voltar"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Checklist</CardTitle>
          <CardDescription>Informações detalhadas do checklist da viatura</CardDescription>
        </CardHeader>
        <CardContent>
        <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-primary" />
            </div>
        </div>

        <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
            <TabsTrigger value="itens">Itens do Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="dados">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                <p className="text-sm text-muted-foreground">Viatura</p>
                <p className="text-sm font-medium">
                    {checklist.tblviaturas?.viaturamarca} ({checklist.tblviaturas?.viaturamatricula})
                </p>
                </div>
                <div>
                <p className="text-sm text-muted-foreground">Motorista</p>
                <p className="text-sm font-medium">{checklist.tblfuncionarios?.funcionarionome}</p>
                </div>
                <div>
                <p className="text-sm text-muted-foreground">Odômetro</p>
                <p className="text-sm font-medium">{checklist.odometro.toLocaleString()} km</p>
                </div>
                <div>
                <p className="text-sm text-muted-foreground">Combustível</p>
                <p className="text-sm font-medium">{checklist.nivelcombustivel}</p>
                </div>
                <div>
                <p className="text-sm text-muted-foreground">Pneus</p>
                <p className="text-sm font-medium">{checklist.condicaopneus}</p>
                </div>
                <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="text-sm font-medium">{checklist.status}</p>
                </div>
                <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="text-sm font-medium">
                    {new Date(checklist.datachecklist).toLocaleDateString("pt-PT")}
                </p>
                </div>
                {checklist.observacao && (
                <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm font-medium">{checklist.observacao}</p>
                </div>
                )}
            </div>
            </TabsContent>

            <TabsContent value="itens">
            {items.length === 0 ? (
                <p className="text-muted-foreground">Nenhum item encontrado.</p>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.status}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
            </TabsContent>
        </Tabs>
        </CardContent>

      </Card>
    </div>
  );
}
