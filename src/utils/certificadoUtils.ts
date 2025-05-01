
/**
 * Utility functions for certificate management
 */

/**
 * Calculate certificate status based on expiration date
 * @param dataVencimento The expiration date
 * @returns Status string: "expirado", "a_vencer", or "válido"
 */
export const calcularStatusCertificado = (dataVencimento: Date): string => {
  const hoje = new Date();
  const diffEmMilissegundos = dataVencimento.getTime() - hoje.getTime();
  const diasParaVencer = diffEmMilissegundos / (1000 * 60 * 60 * 24);

  if (dataVencimento < hoje) {
    return "expirado";
  } else if (diasParaVencer <= 30) {
    return "a_vencer";
  } else {
    return "válido";
  }
};
