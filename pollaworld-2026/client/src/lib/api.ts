const API_BASE = "/api";

export interface User {
  id: string;
  name: string;
  phone: string;
  player_slug: string;
  role: "participant" | "admin";
  avatar_url: string | null;
  created_at?: string;
}

export interface Entry {
  id: string;
  user_id: string;
  ticket_number: number;
  payment_status: "pending" | "approved" | "rejected";
  payment_proof_url: string | null;
  created_at: string;
}

export interface Incident {
  type: "goal" | "card" | "sub";
  team: "home" | "away";
  minute: number;
  player: string;
  card?: "yellow" | "red";
  player_out?: string;
  player_in?: string;
}

export interface GroupStandingTeam {
  name: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface GroupStanding {
  groupName: string;
  teams: GroupStandingTeam[];
}

export interface RecentFormEntry {
  result: "W" | "D" | "L";
  opponent: string;
  score: string;
  matchDate: string;
}

export interface TeamRecentForm {
  teamName: string;
  form: RecentFormEntry[];
  formString: string;
}

export interface Match {
  id: string;
  phase: "groups" | "round_of_32" | "round_of_16" | "quarterfinals" | "semifinals" | "final_3rd" | "final";
  group_name: string | null;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  match_date: string;
  home_score_real: number | null;
  away_score_real: number | null;
  incidents: Incident[];
  is_locked: boolean;
  match_order: number;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score_pred: number;
  away_score_pred: number;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface MatchWithPrediction extends Match {
  prediction: Prediction | null;
}

export interface PoolConfig {
  id: string;
  entry_fee: number;
  prize_1st_pct: number;
  prize_2nd_pct: number;
  prize_3rd_pct: number;
  tournament_started: boolean;
  yape_qr_url: string | null;
  yape_phone: string | null;
  whatsapp_group_link: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  player_custom_names: Record<string, string> | null;
}

export interface RankingEntry {
  entryId: string;
  ticketNumber: number;
  userId: string;
  name: string;
  playerSlug: string;
  totalPoints: number;
  exactScores: number;
  correctResults: number;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  phone: string;
  player_slug: string;
  ticketNumber: number;
}

export interface ExportData {
  exported_at: string;
  users: {
    user: { id: string; name: string; phone: string; player_slug: string };
    predictions: { prediction: Prediction; match: Match }[];
  }[];
  matches: Match[];
}

async function getCSRFToken(): Promise<string | null> {
  // CSRF token is stored in a non-httpOnly cookie, accessible from JS
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? match[1] : null;
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...options?.headers as Record<string, string> };

  // Add CSRF token for mutation requests
  if (options?.method && MUTATION_METHODS.has(options.method)) {
    const token = await getCSRFToken();
    if (token) headers["x-csrf-token"] = token;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers,
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error de conexión");
  return data;
}

// Auth
export const api = {
  register: (body: { name: string; phone: string; password: string; player_slug: string }) =>
    request<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { phone: string; password: string }) =>
    request<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: User }>("/auth/me"),

  // Pool config
  getPoolConfig: () => request<PoolConfig>("/pool/config"),

  // Matches
  getMatches: () => request<Match[]>("/matches"),
  getLiveMatches: () => request<{ live: Match[]; recent: Match[] }>("/matches/live"),
  getStandings: () => request<GroupStanding[]>("/standings"),

  // Profile
  updateName: (name: string) =>
    request<{ user: User }>("/profile/name", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  uploadAvatar: async (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    const token = await getCSRFToken();
    const headers: Record<string, string> = {};
    if (token) headers["x-csrf-token"] = token;
    return fetch(`${API_BASE}/profile/avatar`, {
      method: "POST",
      credentials: "include",
      headers,
      body: fd,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir avatar");
      return data as { avatar_url: string; message: string };
    });
  },

  updatePlayer: (player_slug: string) =>
    request<{ user: User }>("/profile/player", {
      method: "PATCH",
      body: JSON.stringify({ player_slug }),
    }),

  // ── Entries ──
  getEntries: () => request<Entry[]>("/entries"),

  createEntry: () => request<Entry>("/entries", { method: "POST" }),

  // Predictions
  getMatchesWithPredictions: (entryId: string) =>
    request<MatchWithPrediction[]>(`/predictions/matches/${entryId}`),

  savePrediction: (entryId: string, matchId: string, home_score_pred: number, away_score_pred: number) =>
    request<Prediction>("/predictions", {
      method: "POST",
      body: JSON.stringify({ entry_id: entryId, match_id: matchId, home_score_pred, away_score_pred }),
    }),

  saveBulkPredictions: (entryId: string, predictions: { match_id: string; home_score_pred: number; away_score_pred: number }[]) =>
    request<{ saved: number; predictions: Prediction[] }>("/predictions/bulk", {
      method: "POST",
      body: JSON.stringify({ entry_id: entryId, predictions }),
    }),

  getPopularPredictions: () =>
    request<Record<string, { home_score_pred: number; away_score_pred: number }>>("/predictions/popular"),

  // Payments (per entry)
  uploadPaymentProof: async (entryId: string, file: File) => {
    const formData = new FormData();
    formData.append("entry_id", entryId);
    formData.append("proof", file);
    const token = await getCSRFToken();
    const headers: Record<string, string> = {};
    if (token) headers["x-csrf-token"] = token;
    return fetch(`${API_BASE}/payments/upload`, {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir");
      return data as { url: string; message: string };
    });
  },

  // ── Admin: Entries ──
  getAdminEntries: () => request<Entry[]>("/admin/entries"),

  getAdminPendingEntries: () => request<Entry[]>("/admin/entries/pending"),

  getAdminApprovedEntries: () => request<Entry[]>("/admin/entries/approved"),

  approveEntry: (id: string) =>
    request<{ message: string; entry: Entry }>(`/admin/entries/${id}/approve`, { method: "PATCH" }),

  rejectEntry: (id: string, reason?: string) =>
    request<{ message: string; entry: Entry }>(`/admin/entries/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  deleteEntry: (id: string) =>
    request<{ message: string }>(`/admin/entries/${id}`, { method: "DELETE" }),

  getAdminUsers: () => request<User[]>("/admin/users"),

  getExportData: () => request<ExportData>("/admin/predictions/export"),

  getAdminPlayers: () => request<{ customNames: Record<string, string> }>("/admin/players"),

  saveAdminPlayers: (customNames: Record<string, string>) =>
    request<{ message: string; customNames: Record<string, string> }>("/admin/players", {
      method: "PUT",
      body: JSON.stringify({ customNames }),
    }),

  // Pool stats & participants
  getPoolStats: () => request<PoolStats>("/pool/stats"),

  getParticipants: () => request<Participant[]>("/pool/participants"),

  // Ranking
  getRanking: () => request<RankingEntry[]>("/pool/ranking"),

  // User predictions (public, when tournament started)
  getUserPredictions: (userId: string) =>
    request<{ prediction: Prediction; match: Match }[]>(`/predictions/user/${userId}`),

  // Pool config (admin)
  updatePoolConfig: (body: Partial<PoolConfig>) =>
    request<PoolConfig>("/pool/config", { method: "PUT", body: JSON.stringify(body) }),

  // Admin: matches
  createMatch: (data: {
    phase: string;
    group_name: string;
    home_team: string;
    away_team: string;
    home_flag: string;
    away_flag: string;
    match_date: string;
  }) => request<Match>("/matches", { method: "POST", body: JSON.stringify(data) }),

  toggleLock: (matchId: string, locked: boolean) =>
    request<{ message: string }>(`/admin/matches/${matchId}/lock`, { method: "PATCH", body: JSON.stringify({ locked }) }),

  saveMatchResult: (matchId: string, home_score_real: number, away_score_real: number) =>
    request<{ message: string }>(`/admin/matches/${matchId}/result`, { method: "POST", body: JSON.stringify({ home_score_real, away_score_real }) }),

  uploadLogo: async (file: File) => {
    const fd = new FormData();
    fd.append("logo", file);
    const token = await getCSRFToken();
    const headers: Record<string, string> = {};
    if (token) headers["x-csrf-token"] = token;
    return fetch("/api/pool/upload-logo", {
      method: "POST",
      credentials: "include",
      headers,
      body: fd,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      return data as { url: string; message: string };
    });
  },

  uploadFavicon: async (file: File) => {
    const fd = new FormData();
    fd.append("favicon", file);
    const token = await getCSRFToken();
    const headers: Record<string, string> = {};
    if (token) headers["x-csrf-token"] = token;
    return fetch("/api/pool/upload-favicon", {
      method: "POST",
      credentials: "include",
      headers,
      body: fd,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      return data as { url: string; message: string };
    });
  },

  uploadYapeQr: async (file: File) => {
    const fd = new FormData();
    fd.append("qr", file);
    const token = await getCSRFToken();
    const headers: Record<string, string> = {};
    if (token) headers["x-csrf-token"] = token;
    return fetch("/api/pool/upload-yape-qr", {
      method: "POST",
      credentials: "include",
      headers,
      body: fd,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      return data as { url: string; message: string };
    });
  },

  // ── Testing / Admin tools ──
  resetTournament: () =>
    request<{ message: string }>("/admin/testing/reset-tournament", { method: "POST" }),

  activateDemo: () =>
    request<{ message: string; approved: number }>("/admin/testing/activate-demo", { method: "POST" }),

  verifySystem: () =>
    request<{
      config: { ok: boolean; tournament_started: boolean; entry_fee: number | null; yape_configured: boolean };
      matches: { total: number; locked: number; with_result: number; ok: boolean };
      entries: { total: number; approved: number; pending: number; ok: boolean };
      predictions: { total: number; ok: boolean };
    }>("/admin/testing/verify"),

  runSimulation: (home_real: number, away_real: number) =>
    request<{
      message: string;
      match: { id: string; home_team: string; away_team: string; result: string };
      scoring_rules: Record<string, string>;
      results: { name: string; pred: string; points: number; expected: number; pass: boolean }[];
    }>("/admin/testing/run-simulation", {
      method: "POST",
      body: JSON.stringify({ home_real, away_real }),
    }),

  cleanupDemo: () =>
    request<{ message: string; deleted: number }>("/admin/testing/cleanup-demo", { method: "POST" }),
};

export interface PoolStats {
  approvedCount: number;
  entryFee: number;
  totalPool: number;
  prizes: { first: number; second: number; third: number };
  tournamentStarted: boolean;
}
