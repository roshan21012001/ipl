export interface Team {
  id: string;
  name: string;
  shortName: string;
  link: string;
  image: string;
  championships: string;
  totalTitles: number;
}

export interface PointsTableEntry {
  team: string;
  position: number;
  played: number;
  won: number;
  lost: number;
  points: number;
  netRunRate: number;
}

export interface PointsTableResponse {
  teams: PointsTableEntry[];
  lastUpdated: string | null;
}

export interface TeamsResponse {
  teams: Team[];
  totalTeams: number;
  championTeams: number;
  lastUpdated: string | null;
  source: string;
  note: string;
}
