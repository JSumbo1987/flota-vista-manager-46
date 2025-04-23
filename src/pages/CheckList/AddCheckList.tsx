import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// VALIDAÇÃO
const formSchema = z.object({
  viaturaId: z.string().min(1, "Selecione a viatura"),
  motoristaId: z.string().min(1, "Selecione o motorista"),
  odometro: z.number().positive("Informe um valor válido"),
  nivelCombustivel: z.string(),
  condicaoPneus: z.string(),
  observacao: z.string().optional(),
  status: z.string(),
  itens: z.array(z.object({
    descricao: z.string(),
    marcado: z.boolean(),
    status: z.string(),
  })),
});

type FormValues = z.infer<typeof formSchema>;

// ITENS PADRÃO DO CHECKLIST
const defaultItensChecklist = [
  { descricao: "Faróis funcionando", status: "OK", marcado: false },
  { descricao: "Nível do óleo", status: "OK", marcado: false },
  { descricao: "Freios revisados", status: "OK", marcado: false },
];

const AddChecklist = () => {
  const navigate = useNavigate();
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
      itens: defaultItensChecklist,
    },
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = form;
  const { fields } = useFieldArray({ control, name: "itens" });

  const onSubmit = (data: FormValues) => {
    console.log("Checklist Enviado:", data);
    toast({ title: "Checklist cadastrado com sucesso!" });
    navigate("/checklists");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Novo Checklist</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Viatura</Label>
            <Select onValueChange={(val) => setValue("viaturaId", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a viatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Toyota Hilux (ABC-1234)</SelectItem>
                <SelectItem value="2">Ford Ranger (XYZ-5678)</SelectItem>
              </SelectContent>
            </Select>
            {errors.viaturaId && <p className="text-red-500 text-sm">{errors.viaturaId.message}</p>}
          </div>
          <div>
            <Label>Motorista</Label>
            <Select onValueChange={(val) => setValue("motoristaId", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motorista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Carlos Manuel</SelectItem>
                <SelectItem value="2">Ana Silva</SelectItem>
              </SelectContent>
            </Select>
            {errors.motoristaId && <p className="text-red-500 text-sm">{errors.motoristaId.message}</p>}
          </div>

          <div>
            <Label>Odômetro (km)</Label>
            <Input type="number" {...register("odometro", { valueAsNumber: true })} />
            {errors.odometro && <p className="text-red-500 text-sm">{errors.odometro.message}</p>}
          </div>

          <div>
            <Label>Nível de Combustível</Label>
            <Select onValueChange={(val) => setValue("nivelCombustivel", val)} defaultValue="Cheio">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cheio">Cheio</SelectItem>
                <SelectItem value="Meio tanque">Meio tanque</SelectItem>
                <SelectItem value="Reserva">Reserva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Condição dos Pneus</Label>
            <Input {...register("condicaoPneus")} />
            {errors.condicaoPneus && <p className="text-red-500 text-sm">{errors.condicaoPneus.message}</p>}
          </div>

          <div>
            <Label>Status</Label>
            <Select onValueChange={(val) => setValue("status", val)} defaultValue="Aprovado">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pendências">Pendências</SelectItem>
                <SelectItem value="Reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label>Observações</Label>
            <Textarea {...register("observacao")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens do Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4">
              <Checkbox
                checked={watch(`itens.${index}.marcado`)}
                onCheckedChange={(checked) => setValue(`itens.${index}.marcado`, !!checked)}
              />
              <span className="w-1/2">{field.descricao}</span>
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
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => navigate("/checklist")}>Cancelar</Button>
        <Button type="submit">Salvar Checklist</Button>
      </div>
    </form>
  );
};

export default AddChecklist;