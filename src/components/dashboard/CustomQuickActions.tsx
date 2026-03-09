import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAction {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
}

interface CustomQuickActionsProps {
  actions: QuickAction[];
}

export function CustomQuickActions({ actions }: CustomQuickActionsProps) {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm animate-fade-in">
      <div className="p-4 md:p-6 border-b border-border/50">
        <h3 className="section-title text-foreground">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 md:p-6">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-secondary/50 transition-all duration-200 group"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}
            >
              <action.icon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground text-sm">
                {action.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}