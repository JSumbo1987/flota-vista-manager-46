
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CompanySettingsTab = () => {
  const { toast } = useToast();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [enderecoEmpresa, setEnderecoEmpresa] = useState("");
  const [telefoneEmpresa, setTelefoneEmpresa] = useState("");
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [logoEmpresa, setLogoEmpresa] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCompany = async () => {
    setIsSaving(true);
    
    try {
      // Aqui iríamos salvar as configurações da empresa no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da empresa foram atualizadas com sucesso."
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyName">Nome da Empresa</Label>
          <Input
            id="companyName"
            placeholder="Flota Vista Ltda."
            value={nomeEmpresa}
            onChange={(e) => setNomeEmpresa(e.target.value)}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyAddress">Endereço</Label>
          <Input
            id="companyAddress"
            placeholder="Rua Exemplo, 123, Cidade"
            value={enderecoEmpresa}
            onChange={(e) => setEnderecoEmpresa(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyPhone">Telefone</Label>
          <Input
            id="companyPhone"
            placeholder="+351 123 456 789"
            value={telefoneEmpresa}
            onChange={(e) => setTelefoneEmpresa(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyEmail">Email</Label>
          <Input
            id="companyEmail"
            placeholder="contato@flotavista.com"
            value={emailEmpresa}
            onChange={(e) => setEmailEmpresa(e.target.value)}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyLogo">Logo da Empresa</Label>
          <Input
            id="companyLogo"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoEmpresa(e.target.files?.[0] || null)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Formatos aceitos: JPG, PNG (máximo 2MB)
          </p>
        </div>
      </div>
      
      <Button 
        onClick={handleSaveCompany} 
        className="mt-4 w-full sm:w-auto" 
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};

export default CompanySettingsTab;
