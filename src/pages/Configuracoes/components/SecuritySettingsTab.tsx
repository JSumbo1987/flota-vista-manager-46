
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SecuritySettingsTab = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <Label htmlFor="twoFactorAuth">Autenticação de Dois Fatores</Label>
              <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em Breve</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Exigir verificação adicional ao fazer login
            </p>
          </div>
          <Switch
            id="twoFactorAuth"
            disabled
          />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Política de Senhas</Label>
          <div className="space-y-2 pl-4">
            <div className="flex items-center">
              <Switch id="passwordMinLength" defaultChecked disabled />
              <Label htmlFor="passwordMinLength" className="ml-2">
                Mínimo de 8 caracteres
              </Label>
            </div>
            <div className="flex items-center">
              <Switch id="passwordSpecialChar" defaultChecked disabled />
              <Label htmlFor="passwordSpecialChar" className="ml-2">
                Caracteres especiais obrigatórios
              </Label>
            </div>
            <div className="flex items-center">
              <Switch id="passwordExpiry" defaultChecked disabled />
              <Label htmlFor="passwordExpiry" className="ml-2">
                Expirar senhas a cada 90 dias
              </Label>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">Tempo Limite de Sessão</Label>
          <Select defaultValue="30">
            <SelectTrigger id="sessionTimeout">
              <SelectValue placeholder="Selecione o tempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
              <SelectItem value="never">Nunca expirar</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Tempo de inatividade antes de encerrar sessão automaticamente
          </p>
        </div>
      </div>
      
      <Button 
        className="mt-4 w-full sm:w-auto" 
        disabled={true}
      >
        Salvar Configurações
      </Button>
    </div>
  );
};

export default SecuritySettingsTab;
