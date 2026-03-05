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
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4 text-center">
        <h2 className="section-title mb-2">{t("partners.title")}</h2>
        <p className="text-muted-foreground mb-10 text-sm">{t("partners.desc")}</p>
        <div className="flex flex-wrap justify-center gap-6">
          {partners.map((p) => (
            <div key={p} className="w-28 h-20 bg-card border border-border rounded-xl flex items-center justify-center text-xs text-muted-foreground font-medium text-center px-2">
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
