
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string | null;
}

const ResetPasswordDialog = ({ isOpen, onClose, userId, userName }: ResetPasswordDialogProps) => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!userId) return;
    
    setError(null);
    
    // Validate password
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    
    // Confirm passwords match
    if (newPassword !== confirmPassword) {
      setError("As senhas não correspondem.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update password in database
      const { error } = await supabase
        .from("tblusuarios")
        .update({ 
          userpassword: newPassword,
          isfastlogin: 0 // Force password change on next login
        })
        .eq("userid", userId);
      
      if (error) throw error;
      
      setSuccess(true);
      toast({
        title: "Senha redefinida com sucesso",
        description: `A senha para ${userName} foi alterada.`,
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setNewPassword("");
        setConfirmPassword("");
        setSuccess(false);
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      setError("Ocorreu um erro ao redefinir a senha. Tente novamente.");
      toast({
        title: "Erro ao redefinir senha",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
        setSuccess(false);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redefinir Senha</DialogTitle>
          <DialogDescription>
            {userName ? `Definir nova senha para ${userName}` : "Definir nova senha"}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Senha redefinida com sucesso!</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
            />
          </div>
        </div>
        
        <DialogFooter className="pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleReset}
            disabled={!newPassword || !confirmPassword || isSubmitting}
          >
            {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
