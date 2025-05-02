
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="text-center py-10">
      <div className="mx-auto text-muted-foreground opacity-50">
        {icon}
      </div>
      <p className="mt-2 text-lg text-muted-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
