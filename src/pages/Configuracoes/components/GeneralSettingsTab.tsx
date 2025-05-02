
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GeneralSettingsTab = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [idioma, setIdioma] = useState("pt");
  const [timezone, setTimezone] = useState("Europe/Lisbon");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações gerais no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações gerais foram atualizadas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="darkMode">Modo Escuro</Label>
            <p className="text-sm text-muted-foreground">
              Ativa o tema escuro na interface do sistema
            </p>
          </div>
          <Switch
            id="darkMode"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select value={idioma} onValueChange={setIdioma}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt">Português (Portugal)</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timezone">Fuso Horário</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Selecione o fuso horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Europe/Lisbon">Lisboa (GMT+1)</SelectItem>
              <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
              <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
              <SelectItem value="America/New_York">Nova Iorque (GMT-5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={handleSaveGeneral} 
        className="mt-4 w-full sm:w-auto" 
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};

export default GeneralSettingsTab;
