import heroImage from "@/assets/hero-dance.jpg";
import practicesImage from "@/assets/dance-about.jpg";

export type AboutValue = { id: string; title: string; desc: string; icon: string };
export type AboutTimeline = { id: string; year: string; title: string; desc: string };
export type AboutMember = { id: string; name: string; role: string; date: string; photo: string };
export type AboutContent = {
  id?: number;
  heroImage: string; heroTitle1: string; heroTitle2: string; heroDesc: string;
  practicesImage: string; practicesTitle1: string; practicesTitle2: string; practicesDesc: string;
  values: AboutValue[]; timeline: AboutTimeline[]; bureau: AboutMember[];
};

export const defaultAboutContent: AboutContent = {
  heroImage, heroTitle1: "Fédération Tunisienne de Danse", heroTitle2: "Sportive et Artistique",
  heroDesc: "La FTDAP regroupe l'ensemble des disciplines de danse en Tunisie depuis 1989.",
  practicesImage, practicesTitle1: "Nos Disciplines", practicesTitle2: "Pratiquées",
  practicesDesc: "Découvrez la richesse des disciplines de danse encadrées par la fédération.",
  values: [
    { id: "mission", title: "Mission", desc: "Promouvoir et développer la danse sportive et artistique en Tunisie.", icon: "Target" },
    { id: "vision", title: "Vision", desc: "Faire de la Tunisie une référence régionale en danse sportive.", icon: "Eye" },
    { id: "objectifs", title: "Objectifs", desc: "Former, encadrer et organiser les compétitions nationales et internationales.", icon: "Flag" },
  ],
  timeline: [
    { id: "creation", year: "1989", title: "Création", desc: "Fondation officielle de la fédération." },
    { id: "evolution", year: "2008–2020", title: "Évolution", desc: "Expansion des disciplines et structuration nationale." },
    { id: "moments", year: "2020–2024", title: "Moments forts", desc: "Participations internationales et nouveaux championnats." },
  ],
  bureau: [
    { id: "president", name: "Mohamed Ben Salah", role: "Président", date: "Depuis 2020", photo: "" },
    { id: "vice", name: "Leila Trabelsi", role: "Vice-Présidente", date: "Depuis 2021", photo: "" },
    { id: "secretary", name: "Karim Jouini", role: "Secrétaire Général", date: "Depuis 2020", photo: "" },
    { id: "treasurer", name: "Sami Bouazizi", role: "Trésorier", date: "Depuis 2022", photo: "" },
    { id: "technical", name: "Ahmed Hamdi", role: "Directeur Technique", date: "Depuis 2021", photo: "" },
  ],
};
