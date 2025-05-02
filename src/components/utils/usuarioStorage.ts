
const USUARIO_STORAGE_KEY = 'usuario_logado';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  foto?: string;
  token?: string;
  tokenExpiracao?: string;
  userid?: string; // Adding userid field for compatibility
}

// Função para obter o usuário do storage
export const obterUsuario = (): Usuario | null => {
  const usuarioJSON = localStorage.getItem(USUARIO_STORAGE_KEY);
  if (!usuarioJSON) return null;
  
  try {
    const usuario = JSON.parse(usuarioJSON) as Usuario;
    return usuario;
  } catch (error) {
    console.error('Erro ao ler dados do usuário:', error);
    return null;
  }
};

// Função para salvar o usuário no storage
export const salvarUsuario = (usuario: Usuario): void => {
  try {
    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(usuario));
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
  }
};

// Função para limpar o usuário do storage
export const limparUsuario = (): void => {
  localStorage.removeItem(USUARIO_STORAGE_KEY);
};

// Função para verificar se o usuário está autenticado
export const estaAutenticado = (): boolean => {
  const usuario = obterUsuario();
  return !!usuario;
};

// Função para verificar se o token do usuário está expirado
export const tokenExpirado = (): boolean => {
  const usuario = obterUsuario();
  if (!usuario?.tokenExpiracao) return true;
  
  try {
    const dataExpiracao = new Date(usuario.tokenExpiracao);
    return dataExpiracao < new Date();
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error);
    return true;
  }
};

// Função para obter o token do usuário
export const obterToken = (): string => {
  const usuario = obterUsuario();
  return usuario?.token || '';
};

// Função para verificar se o usuário tem um determinado perfil
export const temPerfil = (perfil: string): boolean => {
  const usuario = obterUsuario();
  if (!usuario) return false;
  
  return usuario.perfil === perfil;
};
