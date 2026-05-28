export type ApprovalStatus = "pending" | "accepted" | "rejected";
export type PaymentStatus = "paid" | "unpaid";

export interface UploadedDoc {
  name: string;
  uploadedAt: string;
  size?: number;
  dataUrl?: string; // base64 image data for preview
}

export interface ClubMember {
  id: string;
  clubName: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: "M" | "F";
  discipline: string;
  phone?: string;
  email?: string;
  documents: {
    cin?: UploadedDoc;            // Adults only
    birthExtract?: UploadedDoc;   // Both (مضمون)
    parentalAuth?: UploadedDoc;   // Minors only (ترخيص أبوي)
    photo?: UploadedDoc;          // Minors only (الصورة)
  };
  payment: {
    status: PaymentStatus;
    receipt?: UploadedDoc;
    amount?: number;
    updatedAt?: string;
  };
  approval: {
    status: ApprovalStatus;
    submittedAt?: string;
    reviewedAt?: string;
    reviewerNote?: string;
  };
  createdAt: string;
}

const KEY = "ftdap_club_members";

export const loadClubMembers = (): ClubMember[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ClubMember[]) : [];
  } catch {
    return [];
  }
};

export const saveClubMembers = (members: ClubMember[]) => {
  localStorage.setItem(KEY, JSON.stringify(members));
};

export const upsertClubMember = (m: ClubMember) => {
  const list = loadClubMembers();
  const idx = list.findIndex((x) => x.id === m.id);
  if (idx >= 0) list[idx] = m;
  else list.unshift(m);
  saveClubMembers(list);
};

export const removeClubMember = (id: string) => {
  saveClubMembers(loadClubMembers().filter((m) => m.id !== id));
};

export const computeAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return 0;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
};