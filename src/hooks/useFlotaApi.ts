import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://api-flota.vercel.app/api';

export const useFlotaApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDocumentos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/check-documentos`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar documentos');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetarPassword = async (email: string, nomeUsuario: string, novaSenha: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/reset-password`, {
        to: email,
        nomeUsuario,
        novaSenha
      });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmation = async (email: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/send-confirmation`, {
        to: email,
        userid: userId
      });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar confirmação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkDocumentos,
    resetarPassword,
    sendConfirmation,
    loading,
    error
  };
};
