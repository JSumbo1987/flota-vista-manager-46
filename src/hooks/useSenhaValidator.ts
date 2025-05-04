import { useState } from "react";

export function useSenhaValidator() {
  const [erro, setErro] = useState<string | null>(null);

  function validar(senha: string): boolean {
    if (senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return false;
    }
    if (!/[A-Z]/.test(senha)) {
      setErro("A senha deve conter ao menos uma letra maiúscula.");
      return false;
    }
    if (!/[a-z]/.test(senha)) {
      setErro("A senha deve conter ao menos uma letra minúscula.");
      return false;
    }
    if (!/[0-9]/.test(senha)) {
      setErro("A senha deve conter ao menos um número.");
      return false;
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(senha)) {
      setErro("A senha deve conter ao menos um caractere especial.");
      return false;
    }

    setErro(null);
    return true;
  }

  return { erro, validar };
}
