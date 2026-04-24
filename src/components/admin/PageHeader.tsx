import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: { label: string; value: string | number; color?: string }[];
}

export const PageHeader = ({ title, description, actions, stats }: PageHeaderProps) => {
  return (
    <div className="bg-background rounded-xl border p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color || "text-foreground"}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};