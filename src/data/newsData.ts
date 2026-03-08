import gallery1 from "@/assets/gallery1.jpg";
import gallery2 from "@/assets/gallery2.jpg";
import gallery3 from "@/assets/gallery3.jpg";
import gallery4 from "@/assets/gallery4.jpg";
import gallery5 from "@/assets/gallery5.jpg";
import gallery6 from "@/assets/gallery6.jpg";
import heroDance from "@/assets/hero-dance.jpg";
import news1 from "@/assets/news1.jpg";
import news2 from "@/assets/news2.jpg";

export type NewsCategory = "competition" | "event";

export interface NewsItem {
  id: number;
  image: string;
  category: NewsCategory;
  date: string;
  titleKey: string;
  descKey: string;
  bodyKey: string;
  galleryImages: string[];
}

export const newsData: NewsItem[] = [
  {
    id: 1, image: gallery1, category: "competition", date: "23 Sept 2023",
    titleKey: "np.card1.title", descKey: "np.card1.desc", bodyKey: "np.card1.body",
    galleryImages: [gallery1, gallery2, gallery3],
  },
  {
    id: 2, image: gallery2, category: "event", date: "01 Nov 2023",
    titleKey: "np.card2.title", descKey: "np.card2.desc", bodyKey: "np.card2.body",
    galleryImages: [gallery4, gallery5, gallery6],
  },
  {
    id: 3, image: gallery3, category: "competition", date: "01 Nov 2023",
    titleKey: "np.card3.title", descKey: "np.card3.desc", bodyKey: "np.card3.body",
    galleryImages: [heroDance, news1, news2],
  },
  {
    id: 4, image: gallery4, category: "competition", date: "23 Sept 2023",
    titleKey: "np.card1.title", descKey: "np.card1.desc", bodyKey: "np.card1.body",
    galleryImages: [gallery1, gallery2, gallery3],
  },
  {
    id: 5, image: gallery5, category: "event", date: "01 Nov 2023",
    titleKey: "np.card2.title", descKey: "np.card2.desc", bodyKey: "np.card2.body",
    galleryImages: [gallery4, gallery5, gallery6],
  },
  {
    id: 6, image: gallery6, category: "competition", date: "01 Nov 2023",
    titleKey: "np.card3.title", descKey: "np.card3.desc", bodyKey: "np.card3.body",
    galleryImages: [heroDance, news1, news2],
  },
  {
    id: 7, image: heroDance, category: "competition", date: "23 Sept 2023",
    titleKey: "np.card1.title", descKey: "np.card1.desc", bodyKey: "np.card1.body",
    galleryImages: [gallery1, gallery2, gallery3],
  },
  {
    id: 8, image: news1, category: "event", date: "01 Nov 2023",
    titleKey: "np.card2.title", descKey: "np.card2.desc", bodyKey: "np.card2.body",
    galleryImages: [gallery4, gallery5, gallery6],
  },
  {
    id: 9, image: news2, category: "competition", date: "01 Nov 2023",
    titleKey: "np.card3.title", descKey: "np.card3.desc", bodyKey: "np.card3.body",
    galleryImages: [heroDance, news1, news2],
  },
];
