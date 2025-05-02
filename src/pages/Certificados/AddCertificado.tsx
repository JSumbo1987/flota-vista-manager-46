
import CertificadoHeader from "@/components/certificados/CertificadoHeader";
import CertificadoForm from "@/components/certificados/CertificadoForm";

const AddCertificado = () => {
  return (
    <div className="space-y-4">
      <CertificadoHeader 
        title="Adicionar Certificado" 
        description="Registre um novo certificado de inspeção para uma viatura" 
      />
      <CertificadoForm />
    </div>
  );
};

export default AddCertificado;
