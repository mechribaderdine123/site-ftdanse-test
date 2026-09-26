export interface RankingParticipant {
  rank: number;
  name: string;
  club: string;
}

export interface RankingEvent {
  source?: "competition" | "result";
  participants: RankingParticipant[];
  results?: Array<{ position: string; athlete: string; club: string }>;
}

export interface RankingRow {
  id: string;
  name: string;
  club: string;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
}

export const deriveRanking = (events: RankingEvent[]): RankingRow[] => {
  const rows = new Map<string, RankingRow>();

  events
    .filter((event) => event.source === "competition")
    .forEach((event) => {
      const participants = [...event.participants];
      (event.results || []).forEach((result) => {
        const rank = Number(result.position);
        if (Number.isFinite(rank)) participants.push({ rank, name: result.athlete, club: result.club });
      });
      participants.forEach((participant) => {
        const name = participant.name.trim();
        const club = participant.club.trim();
        if (!name) return;
        const id = `${name.toLowerCase()}::${club.toLowerCase()}`;
        const current = rows.get(id) || { id, name, club, points: 0, gold: 0, silver: 0, bronze: 0 };
        if (participant.rank === 1) { current.points += 3; current.gold += 1; }
        if (participant.rank === 2) { current.points += 2; current.silver += 1; }
        if (participant.rank === 3) { current.points += 1; current.bronze += 1; }
        rows.set(id, current);
      });
    });

  return Array.from(rows.values()).sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
};
