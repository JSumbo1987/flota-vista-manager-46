import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const AddAbastecimento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viaturaId, setViaturaId] = useState("");
  const [dataAbastecimento, setDataAbastecimento] = useState<Date | undefined>(new Date());
  const [litros, setLitros] = useState("");
  const [precoLitro, setPrecoLitro] = useState("");
  const [postoAbastecimento, setPostoAbastecimento] = useState("");
  const [nrTalaoAbastecimento, setNrTalaoAbastecimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [matriculaInput, setMatriculaInput] = useState("");
  const [viaturaEncontrada, setViaturaEncontrada] = useState(false);
  const [viaturas, setViaturas] = useState([]);

  useEffect(() => {
    const fetchViaturas = async () => {
      const { data, error } = await supabase
        .from("tblviaturas")
        .select("viaturaid, viaturamarca, viaturamatricula");

      if (!error && data) {
        setViaturas(
          data.map((v) => ({
            ...v,
            viaturaid: String(v.viaturaid), // força string
          }))
        );
      }
    };

    fetchViaturas();
  }, []);

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase();
    setMatriculaInput(input);
  
    const encontrada = viaturas.find(v => v.viaturamatricula.toUpperCase() === input);
    if (encontrada) {
      setViaturaEncontrada(true);
      setViaturaId(encontrada.viaturaid);
    } else {
      setViaturaEncontrada(false);
      setViaturaId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!viaturaId || !dataAbastecimento || !(dataAbastecimento instanceof Date) || !litros || !precoLitro) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let talaoFilePath = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `taloes-abastecimentos/${Date.now()}-${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        talaoFilePath = filePath;
      }

      const { error } = await supabase.from("tblabastecimentos").insert([
        {
          viaturaid: Number(viaturaId),
          dataabastecimento: dataAbastecimento.toISOString().slice(0, 10),
          litros: parseFloat(litros),
          precolitro: parseFloat(precoLitro),
          postoabastecimento: postoAbastecimento,
          nrtalaoabastecimento: nrTalaoAbastecimento,
          observacoes: observacoes,
          talaoabastecimento: talaoFilePath,
        },
      ]);
console.log(error);
      if (error) throw error;

      toast({
        title: "Abastecimento registrado",
        description: "O abastecimento foi registrado com sucesso.",
      });

      navigate("/viaturas");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Erro ao registrar abastecimento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/viaturas")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Adicionar Abastecimento</h2>
          <p className="text-muted-foreground">Registre um novo abastecimento de viatura</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Abastecimento</CardTitle>
            <CardDescription>Preencha os dados do abastecimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula da Viatura*</Label>
                  <div className="relative">
                      <Input
                      id="matricula"
                      value={matriculaInput}
                      onChange={handleMatriculaChange}
                      placeholder="Digite a matrícula (ex: AB-12-CD)"
                      required
                      />
                      {viaturaEncontrada && (
                      <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
                      )}
                  </div>
                </div>
                {/* Número do Talão */}
                <div className="flex-1 space-y-2">
                  <Label htmlFor="nrtalao">Número do Talão</Label>
                  <Input id="nrtalao" value={nrTalaoAbastecimento} onChange={(e) => setNrTalaoAbastecimento(e.target.value.toUpperCase())}
                    placeholder="Número do talão" maxLength={20}/>
                </div>

                <div className="grid grid-rows-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 flex gap-4">
                      {/* Posto de Abastecimento */}
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="posto">Posto de Abastecimento</Label>
                        <Input id="posto" value={postoAbastecimento} onChange={(e) => setPostoAbastecimento(e.target.value.toUpperCase())}
                          placeholder="Nome do posto"/>
                      </div>
                      {/* Litros */}
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="litros">Litros*</Label>
                        <Input id="litros" type="number" value={litros} onChange={(e) => setLitros(e.target.value)}
                          placeholder="Quantidade abastecida"/>
                      </div>
                    </div>
                  <div className="col-span-2 flex gap-4">
                      {/* Preço por Litro */}
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="precolitro">Preço por Litro*</Label>
                        <Input id="precolitro" type="number" value={precoLitro} onChange={(e) => setPrecoLitro(e.target.value)}
                          placeholder="Preço unitário"/>
                      </div>
                      {/* Data Abastecimento */}
                      <div className="flex-1 space-y-2">
                        <Label>Data do Abastecimento*</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataAbastecimento && "text-muted-foreground")}>
                              <Calendar className="mr-2 h-4 w-4" />
                              {dataAbastecimento
                                ? format(dataAbastecimento, "dd/MM/yyyy", { locale: ptBR })
                                : <span>Selecione uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={dataAbastecimento}
                              onSelect={setDataAbastecimento}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      </div>
                </div>
                <div className="space-y-4">
                    {/* Upload do Talão */}
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="file">Talão (opcional)</Label>
                      <Input id="file" type="file" accept="application/pdf,image/*"
                        onChange={(e) => { if (e.target.files && e.target.files[0]) { setFile(e.target.files[0]); }
                        }}/>
                    </div> 
                    {/* Observações */}
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Input id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Alguma observação adicional" />
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/viaturas")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Abastecimento"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddAbastecimento;
