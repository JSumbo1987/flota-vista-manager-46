
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CertificadoHeaderProps {
  title: string;
  description: string;
}

const CertificadoHeader = ({ title, description }: CertificadoHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/certificados")}
        className="mr-2"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default CertificadoHeader;
