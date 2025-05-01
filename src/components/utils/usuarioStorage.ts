// utils/usuarioStorage.js
import CryptoJS from "crypto-js";
//import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const CHAVE = process.env.CHAVE_SECRETA; // idealmente vir de uma env
const JWT_SECRET = process.env.JWT_SECRET;

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
/*
// Gera um token JWT com os dados do usuário
export function gerarToken(usuario) {
  const payload = {
    id: usuario.userid,
    nome: usuario.usernome,
    email: usuario.useremail,
    funcionarioid: usuario.tblfuncionarios?.funcionarioid
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  return token;
}

// Verifica o token e retorna os dados do usuário logado
export function verificarToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valido: true, usuario: decoded };
  } catch (erro) {
    return { valido: false, erro: erro.message };
  }
}*/
