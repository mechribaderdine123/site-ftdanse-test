import { useLang } from "@/contexts/LangContext";

const partners = [
  "Ministère de la Jeunesse",
  "CNOT",
  "Ville de Tunis",
  "Sponsor A",
  "Sponsor B",
];

const PartnersSection = () => {
  const { t } = useLang();

  return (
    <section className="py-10 md:py-16 bg-muted">
      <div className="container mx-auto px-4 text-center">
        <h2 className="section-title mb-2">{t("partners.title")}</h2>
        <p className="text-muted-foreground mb-8 md:mb-10 text-xs md:text-sm">{t("partners.desc")}</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 md:gap-6 max-w-lg sm:max-w-none mx-auto">
          {partners.map((p) => (
            <div key={p} className="h-16 md:h-20 bg-card border border-border rounded-lg md:rounded-xl flex items-center justify-center text-[11px] md:text-xs text-muted-foreground font-medium text-center px-2">
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
