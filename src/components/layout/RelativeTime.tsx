
export default function getRelativeTime(timestamp: string): string {
  const createdAt = new Date(timestamp); // UTC timestamp do Supabase
  const now = new Date(); // Horário local

  // Ajuste automático acontece com getTime(), pois ambos são timestamps absolutos (ms desde 1970)
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "agora mesmo";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours} horas`;

  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays} dias`;
}

