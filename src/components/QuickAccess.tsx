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
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-lg font-bold text-primary-foreground mb-8">{t("quick.title")}</h3>
        <div className="flex flex-wrap justify-center gap-6">
          {items.map((item, i) => (
            <motion.a key={item.label} href="#" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="flex flex-col items-center gap-2 w-24 group">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
                <item.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xs text-primary-foreground/80 text-center">{item.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;
