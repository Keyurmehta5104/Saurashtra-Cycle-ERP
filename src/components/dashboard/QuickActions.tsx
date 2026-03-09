import {
  Plus,
  ShoppingCart,
  Users,
  Wrench,
  FileText,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    name: "New Sale",
    description: "Create sales order",
    icon: ShoppingCart,
    href: "/sales/new",
    color: "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg",
  },
  {
    name: "Add Customer",
    description: "Register new customer",
    icon: Users,
    href: "/customers/new",
    color: "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-lg",
  },
  {
    name: "Service Request",
    description: "Log repair job",
    icon: Wrench,
    href: "/service/new",
    color: "bg-gradient-to-br from-warning to-warning/70 text-warning-foreground shadow-lg",
  },
  {
    name: "New Invoice",
    description: "Generate invoice",
    icon: FileText,
    href: "/invoices/new",
    color: "bg-gradient-to-br from-success to-success/70 text-success-foreground shadow-lg",
  },
  {
    name: "Add Stock",
    description: "Update inventory",
    icon: Package,
    href: "/inventory/add",
    color: "bg-gradient-to-br from-chart-5 to-chart-5/70 text-chart-5-foreground shadow-lg",
  },
  {
    name: "Quick Entry",
    description: "Fast data entry",
    icon: Plus,
    href: "/quick-entry",
    color: "bg-gradient-to-br from-secondary to-secondary/70 text-secondary-foreground shadow-lg",
  },
];

export function QuickActions() {
  return (
    <div className="glass-card bg-gradient-to-br from-card/90 to-background/50 border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up">
      <div className="p-5 md:p-7 border-b border-border/50">
        <h3 className="text-xl font-bold text-foreground">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 md:p-6">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl hover:bg-secondary/40 transition-all duration-300 group border border-border/30 hover:border-border/50 hover:shadow-lg"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
            >
              <action.icon className="w-7 h-7" />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground text-base">
                {action.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}