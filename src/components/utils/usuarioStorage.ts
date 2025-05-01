
// utils/usuarioStorage.ts
import CryptoJS from "crypto-js";

const CHAVE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const salvarUsuarioCriptografado = (usuario) => {
  const criptografado = CryptoJS.AES.encrypt(JSON.stringify(usuario), CHAVE).toString();
  localStorage.setItem("usuario", criptografado);
};

export const obterUsuarioDescriptografado = () => {
  const dados = localStorage.getItem("usuario");
  if (!dados) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(dados, CHAVE);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Erro ao descriptografar dados:", error);
    return null;
  }
};

export const limparUsuario = () => {
  localStorage.removeItem("usuario");
};

// Função simplificada para substituir JWT no navegador
export function gerarToken(usuario) {
  // Criamos um objeto com os dados do usuário e a expiração
  const payload = {
    id: usuario.userid,
    nome: usuario.usernome,
    email: usuario.useremail,
    funcionarioid: usuario.tblusuariofuncionario?.funcionarioid,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora de expiração
  };
  
  // Criptografamos o payload inteiro usando CryptoJS
  return CryptoJS.AES.encrypt(JSON.stringify(payload), CHAVE).toString();
}

// Verifica o token e retorna os dados do usuário logado
export function verificarToken(token) {
  try {
    // Descriptografamos o token
    const bytes = CryptoJS.AES.decrypt(token, CHAVE);
    const decoded = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
    // Verificamos se o token expirou
    const agora = Math.floor(Date.now() / 1000);
    if (decoded.exp < agora) {
      return { valido: false, erro: "Token expirado" };
    }
    
    return { valido: true, usuario: decoded };
  } catch (erro) {
    return { valido: false, erro: erro.message };
  }
}
