import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function gerarHashSenha(senha: string): Promise<string> {
  const hash = await bcrypt.hash(senha, SALT_ROUNDS);
  return hash;
}
