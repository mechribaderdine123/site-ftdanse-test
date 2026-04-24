import breakdanceImg from "@/assets/style-breakdance.jpg";
import hiphopImg from "@/assets/style-hiphop.jpg";
import contemporainImg from "@/assets/style-contemporain.jpg";

export interface DisciplineItem {
  slug: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  image: string;
  gallery: string[];
  origin?: string;
  characteristics?: string[];
}

export const disciplinesData: DisciplineItem[] = [
  {
    slug: "breakdance",
    name: "Breakdance",
    shortDesc: "Style urbain dynamique né dans les années 70 à New York.",
    longDesc:
      "Le breakdance est une danse acrobatique au sol et debout, mêlant figures spectaculaires, musicalité et créativité. Discipline olympique depuis Paris 2024.",
    image: breakdanceImg,
    gallery: [breakdanceImg, hiphopImg, contemporainImg],
    origin: "New York, années 1970",
    characteristics: ["Toprock", "Footwork", "Power moves", "Freezes"],
  },
  {
    slug: "hiphop",
    name: "Hip-Hop",
    shortDesc: "Danse urbaine expressive et rythmée.",
    longDesc:
      "Le hip-hop regroupe plusieurs styles (popping, locking, new style) et incarne une culture entière mêlant musique, danse et arts visuels.",
    image: hiphopImg,
    gallery: [hiphopImg, breakdanceImg, contemporainImg],
    origin: "USA, années 1980",
    characteristics: ["Popping", "Locking", "New Style", "Krump"],
  },
  {
    slug: "contemporary",
    name: "Danse Contemporaine",
    shortDesc: "Expression artistique libre et moderne.",
    longDesc:
      "La danse contemporaine combine technique classique, modernité et improvisation pour exprimer émotions et idées à travers le mouvement.",
    image: contemporainImg,
    gallery: [contemporainImg, breakdanceImg, hiphopImg],
    origin: "Europe & USA, XXe siècle",
    characteristics: ["Improvisation", "Sol", "Fluidité", "Émotion"],
  },
  {
    slug: "classic",
    name: "Danse Classique",
    shortDesc: "Tradition et rigueur du ballet.",
    longDesc:
      "Discipline fondatrice exigeant technique, grâce et précision. Base de nombreuses autres formes de danse.",
    image: breakdanceImg,
    gallery: [breakdanceImg, contemporainImg],
    origin: "Italie/France, XVIIe siècle",
    characteristics: ["Pointes", "Pirouettes", "Grâce", "Discipline"],
  },
  {
    slug: "jazz",
    name: "Danse Jazz",
    shortDesc: "Énergie et style du Broadway.",
    longDesc:
      "Mélange de technique classique et de rythmes jazz et populaires. Très présente dans les comédies musicales.",
    image: hiphopImg,
    gallery: [hiphopImg, contemporainImg],
    origin: "USA, début XXe siècle",
    characteristics: ["Isolations", "Sauts", "Énergie", "Style"],
  },
  {
    slug: "sportive",
    name: "Danse Sportive",
    shortDesc: "Compétitions de couples internationales.",
    longDesc:
      "Danse de salon en compétition : standards (valse, tango) et latines (cha-cha, rumba, samba).",
    image: contemporainImg,
    gallery: [contemporainImg, breakdanceImg],
    origin: "Europe, XXe siècle",
    characteristics: ["Couple", "Standard", "Latines", "Compétition"],
  },
  {
    slug: "salsa",
    name: "Salsa",
    shortDesc: "Danse latine festive et sensuelle.",
    longDesc:
      "Originaire des Caraïbes, la salsa se danse en couple sur des rythmes cubains et portoricains entraînants.",
    image: breakdanceImg,
    gallery: [breakdanceImg, hiphopImg],
    origin: "Cuba & Porto Rico",
    characteristics: ["Cubaine", "Portoricaine", "Rueda", "Sensualité"],
  },
  {
    slug: "tango",
    name: "Tango",
    shortDesc: "Passion et élégance argentine.",
    longDesc:
      "Danse de couple intense, le tango se caractérise par ses pas marqués, son étreinte et sa musicalité unique.",
    image: hiphopImg,
    gallery: [hiphopImg, contemporainImg],
    origin: "Argentine, fin XIXe",
    characteristics: ["Étreinte", "Improvisation", "Marche", "Passion"],
  },
  {
    slug: "oriental",
    name: "Danse Orientale",
    shortDesc: "Tradition raffinée du Moyen-Orient.",
    longDesc:
      "La danse orientale met en valeur la souplesse du bassin et la grâce du haut du corps, ancrée dans la culture arabe.",
    image: contemporainImg,
    gallery: [contemporainImg, breakdanceImg],
    origin: "Moyen-Orient & Maghreb",
    characteristics: ["Bassin", "Voile", "Sagatte", "Tradition"],
  },
];