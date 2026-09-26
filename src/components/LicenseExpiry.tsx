import { AlertTriangle, CalendarClock, CheckCircle2, Clock } from "lucide-react";

export type LicenseExpiryInfo = {
  licenseExpiresAt: string | null;
  daysRemaining: number | null;
};

const formatDate = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

/** État visuel : à jour (>60j), à renouveler bientôt (≤60j), urgent (≤15j), expirée. */
export const expiryTone = (info: LicenseExpiryInfo) => {
  if (!info.licenseExpiresAt) return "unknown" as const;
  if (info.daysRemaining === null) return "unknown" as const;
  if (info.daysRemaining < 0) return "expired" as const;
  if (info.daysRemaining <= 15) return "urgent" as const;
  if (info.daysRemaining <= 60) return "soon" as const;
  return "ok" as const;
};

const TONES = {
  ok: {
    cls: "border-green-200 bg-green-50/60 text-green-800",
    icon: CheckCircle2,
    iconCls: "text-green-600",
    label: "Licence à jour",
  },
  soon: {
    cls: "border-yellow-200 bg-yellow-50/60 text-yellow-800",
    icon: Clock,
    iconCls: "text-yellow-600",
    label: "Renouvellement à prévoir",
  },
  urgent: {
    cls: "border-orange-200 bg-orange-50/60 text-orange-800",
    icon: AlertTriangle,
    iconCls: "text-orange-600",
    label: "Renouvellement urgent",
  },
  expired: {
    cls: "border-red-200 bg-red-50/60 text-red-800",
    icon: AlertTriangle,
    iconCls: "text-red-600",
    label: "Licence expirée",
  },
  unknown: {
    cls: "border-border bg-muted/40 text-muted-foreground",
    icon: CalendarClock,
    iconCls: "text-muted-foreground",
    label: "Échéance non définie",
  },
} as const;

const daysLabel = (days: number) => {
  if (days < 0) return `expirée depuis ${Math.abs(days)} j`;
  if (days === 0) return "expire aujourd'hui";
  if (days === 1) return "expire demain";
  return `J-${days}`;
};

/**
 * Bandeau « échéance annuelle » : date de fin de validité + compte à rebours.
 * `children` permet d'ajouter une action (ex. bouton de renouvellement).
 */
const LicenseExpiry = ({
  info,
  children,
  className = "",
}: {
  info: LicenseExpiryInfo;
  children?: React.ReactNode;
  className?: string;
}) => {
  const tone = TONES[expiryTone(info)];
  const Icon = tone.icon;
  return (
    <div className={`rounded-xl border p-4 flex flex-wrap items-center gap-3 ${tone.cls} ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 ${tone.iconCls}`} />
      <div className="flex-1 min-w-[180px]">
        <p className="text-sm font-semibold">{tone.label}</p>
        <p className="text-xs mt-0.5">
          {info.licenseExpiresAt
            ? `Valable jusqu'au ${formatDate(info.licenseExpiresAt)}${info.daysRemaining !== null ? ` · ${daysLabel(info.daysRemaining)}` : ""}`
            : "Aucune échéance enregistrée pour cette licence."}
        </p>
      </div>
      {children}
    </div>
  );
};

export default LicenseExpiry;

/** Version compacte pour les tableaux : date + compte à rebours colorés. */
export const ExpiryChip = ({ info }: { info: LicenseExpiryInfo }) => {
  if (!info.licenseExpiresAt || info.daysRemaining === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const tone = TONES[expiryTone(info)];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${tone.cls}`}>
      <CalendarClock className="w-3 h-3" />
      {new Date(`${info.licenseExpiresAt}T00:00:00`).toLocaleDateString("fr-FR")}
      {` · ${daysLabel(info.daysRemaining)}`}
    </span>
  );
};
