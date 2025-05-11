
export default function getRelativeTime(timestamp) {
  const now = new Date(); // Hora atual
  const createdAt = new Date(timestamp); // Data e hora fornecida

  const diffMs = now - createdAt; // Diferença em milissegundos
  const diffSeconds = Math.floor(diffMs / 1000); // Diferença em segundos
  const diffMinutes = Math.floor(diffSeconds / 60); // Diferença em minutos
  const diffHours = Math.floor(diffMinutes / 60); // Diferença em horas
  
  if (diffSeconds < 60) {
    return "agora mesmo"; // Se for menor que 60 segundos
  }
  if (diffMinutes < 60) {
    return `há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`; // Se for menos de 1 hora
  }
  if (diffHours < 24) {
    return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`; // Se for menos de 1 dia
  }
  const diffDays = Math.floor(diffHours / 24); // Diferença em dias
  return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`; // Se for mais de 1 dia

};





