
import { useState } from "react";
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
  Award,
  Menu
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
  collapsed?: boolean;
}

const NavItem = ({ icon: Icon, label, href, isActive, onClick, collapsed }: NavItemProps) => {
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
      {!collapsed && <span>{label}</span>}
    </Button>
  );
};

const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
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
    <div className={cn("h-full bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300", 
      collapsed ? "w-16" : "w-64")}>
      {/* Logo e botão de colapso */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center">
          <Car className={cn("h-6 w-6", collapsed ? "mr-0" : "mr-2")} />
          {!collapsed && <h1 className="text-xl font-bold text-white">Flota Vista</h1>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse}
          className="text-white p-0 h-6 w-6"
        >
          <Menu className="h-4 w-4" />
        </Button>
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
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Logout button */}
      <div className={cn("p-4 border-t border-sidebar-border", collapsed ? "flex justify-center" : "")}>
        <Button
          variant="ghost"
          className={cn("text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed ? "w-10 h-10 p-0" : "w-full justify-start gap-3 px-3")}
          onClick={() => {
            // TODO: Add logout logic
            handleNavigation("/login");
          }}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
