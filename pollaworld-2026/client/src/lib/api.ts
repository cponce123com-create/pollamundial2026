const API_BASE = "/api";

export interface User {
  id: string;
  name: string;
  phone: string;
  emoji_id: string;
  role: "participant" | "admin";
  payment_status: "pending" | "approved" | "rejected";
  payment_proof_url?: string | null;
  created_at?: string;
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
}

export interface RankingEntry {
  user_id: string;
  name: string;
  emoji_id: string;
  total_points: number;
}

export interface ExportData {
  exported_at: string;
  users: {
    user: { id: string; name: string; phone: string; emoji_id: string };
    predictions: { prediction: Prediction; match: Match }[];
  }[];
  matches: Match[];
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error de conexión");
  return data;
}

// Auth
export const api = {
  register: (body: { name: string; phone: string; password: string; emoji_id: string }) =>
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

  // Predictions
  getMyPredictions: () => request<{ prediction: Prediction; match: Match }[]>("/predictions/my"),

  getMatchesWithPredictions: () => request<MatchWithPrediction[]>("/predictions/matches"),

  savePrediction: (body: { match_id: string; home_score_pred: number; away_score_pred: number }) =>
    request<Prediction>("/predictions", { method: "POST", body: JSON.stringify(body) }),

  saveBulkPredictions: (body: { predictions: { match_id: string; home_score_pred: number; away_score_pred: number }[] }) =>
    request<{ saved: number; predictions: Prediction[] }>("/predictions/bulk", { method: "POST", body: JSON.stringify(body) }),

  getPopularPredictions: () =>
    request<Record<string, { home_score_pred: number; away_score_pred: number }>>("/predictions/popular"),

  // Payments
  uploadPaymentProof: (file: File) => {
    const formData = new FormData();
    formData.append("proof", file);
    return fetch(`${API_BASE}/payments/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir");
      return data as { url: string; message: string };
    });
  },

  // Admin
  getPendingPayments: () =>
    request<User[]>("/admin/payments/pending"),

  getApprovedPayments: () =>
    request<User[]>("/admin/payments/approved"),

  approvePayment: (userId: string) =>
    request<{ message: string; user: User }>(`/admin/payments/${userId}/approve`, { method: "PATCH" }),

  rejectPayment: (userId: string, reason?: string) =>
    request<{ message: string; user: User }>(`/admin/payments/${userId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  getAdminUsers: () => request<User[]>("/admin/users"),

  getExportData: () => request<ExportData>("/admin/predictions/export"),

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

  uploadYapeQr: (file: File) => {
    const fd = new FormData();
    fd.append("qr", file);
    return fetch("/api/pool/upload-yape-qr", {
      method: "POST",
      credentials: "include",
      body: fd,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      return data as { url: string; message: string };
    });
  },
};

export interface PoolStats {
  approvedCount: number;
  entryFee: number;
  totalPool: number;
  prizes: { first: number; second: number; third: number };
  tournamentStarted: boolean;
}

export interface Participant {
  id: string;
  name: string;
  phone: string;
  emoji_id: string;
}
