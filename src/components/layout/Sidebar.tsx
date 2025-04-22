
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Car, 
  Users, 
  Calendar, 
  FileText, 
  Clipboard, 
  Settings, 
  User, 
  Bell, 
  LogOut, 
  Home, 
  FileCheck, 
  Truck, 
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose?: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, href, isActive, onClick }: NavItemProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Button>
  );
};

const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Car, label: "Viaturas", href: "/viaturas" },
    { icon: Users, label: "Funcionários", href: "/funcionarios" },
    { icon: Calendar, label: "Agendamentos", href: "/agendamentos" },
    { icon: FileText, label: "Serviços", href: "/servicos" },
    { icon: Clipboard, label: "Checklist", href: "/checklist" },
    { 
      icon: FileCheck, 
      label: "Certificados", 
      href: "/certificados" 
    },
    { 
      icon: Truck, 
      label: "Licença Transporte", 
      href: "/licenca-transporte" 
    },
    { 
      icon: Award, 
      label: "Licença Publicidade", 
      href: "/licenca-publicidade" 
    },
    { icon: User, label: "Usuários", href: "/usuarios" },
    { icon: Bell, label: "Notificações", href: "/notificacoes" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ];

  return (
    <div className="w-64 h-full bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center">
          <Car className="mr-2 h-6 w-6" />
          Flota Vista
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto flota-scrollbar">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={location.pathname === item.href}
            onClick={() => handleNavigation(item.href)}
          />
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => {
            // TODO: Add logout logic
            handleNavigation("/login");
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
