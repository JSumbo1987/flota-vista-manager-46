// EditChecklist.tsx
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { ChevronLeft } from "lucide-react";

const formSchema = z.object({
  viaturaId: z.string().min(1, "Selecione a viatura"),
  motoristaId: z.string().min(1, "Selecione o motorista"),
  odometro: z.number().positive("Informe um valor válido"),
  nivelCombustivel: z.string(),
  condicaoPneus: z.string(),
  observacao: z.string().optional(),
  status: z.string(),
  itens: z.array(
    z.object({
      descricao: z.string(),
      marcado: z.boolean(),
      status: z.string(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

const EditChecklist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaturas, setViaturas] = useState<any[]>([]);
  const [motoristas, setMotoristas] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      viaturaId: "",
      motoristaId: "",
      odometro: 0,
      nivelCombustivel: "Cheio",
      condicaoPneus: "",
      observacao: "",
      status: "Aprovado",
      itens: [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });

  useEffect(() => {
    const fetchData = async () => {
      const { data: viaturaData } = await supabase.from("tblviaturas").select("viaturaid, viaturamarca, viaturamatricula");
      const { data: motoristaData } = await supabase.from("tblfuncionarios").select("funcionarioid, funcionarionome");
      if (viaturaData) setViaturas(viaturaData);
      if (motoristaData) setMotoristas(motoristaData);
    };

    const fetchChecklist = async () => {
      const { data: checklist, error } = await supabase
        .from("tblchecklist")
        .select("*")
        .eq("id", id)
        .single();

      const { data: itens } = await supabase
        .from("tblchecklistitem")
        .select("descricao, marcado, status")
        .eq("checklistid", id);

      if (checklist && itens) {
        reset({
          viaturaId: checklist.viaturaid.toString(),
          motoristaId: checklist.motoristaid.toString(),
          odometro: checklist.odometro,
          nivelCombustivel: checklist.nivelcombustivel,
          condicaoPneus: checklist.condicaopneus,
          observacao: checklist.observacao,
          status: checklist.status,
          itens,
        });
      }

      if (error) {
        toast({ title: "Erro ao carregar dados do checklist", variant: "destructive" });
      }
    };

    fetchData();
    fetchChecklist();
  }, [id, reset]);

  const onSubmit = async (data: FormValues) => {
    const { error: updateError } = await supabase
      .from("tblchecklist")
      .update({
        viaturaid: parseInt(data.viaturaId),
        motoristaid: parseInt(data.motoristaId),
        odometro: data.odometro,
        nivelcombustivel: data.nivelCombustivel,
        condicaopneus: data.condicaoPneus,
        observacao: data.observacao,
        status: data.status,
      })
      .eq("id", id);

    if (updateError) {
      toast({ title: "Erro ao atualizar checklist", variant: "destructive" });
      return;
    }

    await supabase.from("tblchecklistitem").delete().eq("checklistid", id);

    const itensToInsert = data.itens.map((item) => ({
      checklistid: parseInt(id!),
      descricao: item.descricao,
      marcado: item.marcado,
      status: item.status,
    }));

    const { error: itensError } = await supabase.from("tblchecklistitem").insert(itensToInsert);

    if (itensError) {
      toast({ title: "Erro ao atualizar itens do checklist", variant: "destructive" });
    } else {
      toast({ title: "Checklist atualizado com sucesso!" });
      navigate("/checklist");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/checklist")} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Editar Checklist</h2>
            <p className="text-muted-foreground">Atualize os dados do checklist</p>
          </div>
        </div>
      </div><br/>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
            <TabsTrigger value="itens">Itens do Checklist</TabsTrigger>
          </TabsList>
        <TabsContent value="geral">
        <Card>
            <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>Viatura</Label>
                <Select
                  value={watch("viaturaId")}
                  onValueChange={(val) => setValue("viaturaId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a viatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {viaturas.map((v) => (
                      <SelectItem
                        key={v.viaturaid} value={v.viaturaid.toString()}>
                        {v.viaturamarca} - {v.viaturamatricula}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Motorista</Label>
                <Select
                value={watch("motoristaId")}
                onValueChange={(val) => setValue("motoristaId", val)}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                    {motoristas.map((m) => (
                    <SelectItem key={m.funcionarioid} value={m.funcionarioid.toString()}>
                        {m.funcionarionome}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Odômetro (KM)</Label>
                <Input
                type="number"
                {...register("odometro", { valueAsNumber: true })}
                />
            </div>

            <div>
                <Label>Nível de Combustível</Label>
                <Select value={watch("nivelCombustivel")} onValueChange={(val) => setValue("nivelCombustivel", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione o nível" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Cheio">Cheio</SelectItem>
                    <SelectItem value="Quase cheio">Quase cheio</SelectItem>
                    <SelectItem value="3/4 tanque">3/4 tanque</SelectItem>
                    <SelectItem value="Meio tanque">Meio tanque</SelectItem>
                    <SelectItem value="1/4 tanque">1/4 tanque</SelectItem>
                    <SelectItem value="Reserva">Reserva</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Condição dos Pneus</Label>
                <Input {...register("condicaoPneus")} />
            </div>

            <div>
                <Label>Estado</Label>
                <Select
                value={watch("status")}
                onValueChange={(val) => setValue("status", val)}
                >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Pendências">Pendências</SelectItem>
                    <SelectItem value="Reprovado">Reprovado</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <div className="md:col-span-2">
                <Label>Observação</Label>
                <Textarea rows={4} {...register("observacao")} />
            </div>
            </CardContent>
        </Card>
        </TabsContent>
          <TabsContent value="itens">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Itens do Checklist</CardTitle><br/>
                <Button type="button" onClick={() => append({ descricao: "", status: "OK", marcado: false })}>
                  Adicionar Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-4">
                    <Checkbox
                      checked={watch(`itens.${index}.marcado`)}
                      onCheckedChange={(checked) => setValue(`itens.${index}.marcado`, !!checked)}
                    />
                    <Input className="w-1/2" placeholder="Descrição" {...register(`itens.${index}.descricao`)} />
                    <Select
                      value={watch(`itens.${index}.status`)}
                      onValueChange={(val) => setValue(`itens.${index}.status`, val)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OK">OK</SelectItem>
                        <SelectItem value="Necessita manutenção">Necessita manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" type="button" onClick={() => remove(index)}>Remover</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => navigate("/checklist")}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </>
  );
};

export default EditChecklist;



  

