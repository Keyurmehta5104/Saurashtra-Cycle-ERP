import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  iconColor?: "primary" | "accent" | "success" | "warning";
}

const iconColorClasses = {
  primary: "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg",
  accent: "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-lg",
  success: "bg-gradient-to-br from-success to-success/70 text-success-foreground shadow-lg",
  warning: "bg-gradient-to-br from-warning to-warning/70 text-warning-foreground shadow-lg",
};

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor = "primary",
}: StatCardProps) {
  return (
    <div className="glass-card bg-gradient-to-br from-card/90 to-background/50 border border-border/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slide-up">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
            iconColorClasses[iconColor]
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
        {change && trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full",
              trend === "up" 
                ? "text-success bg-success/20" 
                : "text-destructive bg-destructive/20"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="mt-5">
        <p className="text-sm text-muted-foreground font-medium tracking-wide">{title}</p>
        <p className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}