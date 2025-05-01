
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs"; // Instalar com: npm i bcryptjs
import {salvarUsuarioCriptografado, gerarToken} from "../../components/utils/usuarioStorage";


const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: user, error } = await supabase
        .from("tblusuarios")
        .select("userid, useremail, usernome, userpassword, tblusuariofuncionario(funcionarioid), tblpermissoes(*)")
        .eq("useremail", email)
        .single();

      if (error || !user) {
        toast({
          title: "Usuário não encontrado",
          description: "Credenciais inválidas. Verifique o e-mail.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const senhaCorreta = await bcrypt.compare(password, user.userpassword);

      if (!senhaCorreta) {
        toast({
          title: "Senha incorreta",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Gera o token e armazena os dados do usuário
      const token = gerarToken(user);
      salvarUsuarioCriptografado(user);
      localStorage.setItem("token", token);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema Flota Vista.",
      });

      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Car className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl">Flota Vista</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Lembrar-me
                  </Label>
                </div>
                <Button variant="link" className="p-0 h-auto text-sm">
                  Esqueceu a senha?
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full mb-2"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
