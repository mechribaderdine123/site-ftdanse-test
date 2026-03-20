import { motion } from "framer-motion";
import { FileText, Users, Trophy, ClipboardCheck, BookOpen } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const QuickAccess = () => {
  const { t } = useLang();

  const items = [
    { icon: FileText, label: t("quick.registration") },
    { icon: Users, label: t("quick.clubs") },
    { icon: Trophy, label: t("quick.results") },
    { icon: ClipboardCheck, label: t("quick.refereeing") },
    { icon: BookOpen, label: t("quick.documents") },
  ];

  return (
    <section className="py-10 md:py-16 bg-primary">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-base md:text-lg font-bold text-primary-foreground mb-6 md:mb-8">{t("quick.title")}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 md:gap-6 max-w-lg sm:max-w-none mx-auto">
          {items.map((item, i) => (
            <motion.a key={item.label} href="#" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <span className="text-[11px] md:text-xs text-primary-foreground/80 text-center leading-tight">{item.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;
