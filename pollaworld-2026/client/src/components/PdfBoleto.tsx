import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { Match, Prediction } from "../lib/api";
import { getPlayer } from "../lib/players";
import { getTeamInfo, TEAMS } from "../lib/teams";

// ── Text flags (reliable in PDF vs emoji) ──────────────────────────
const TEXT_FLAGS: Record<string, string> = {};
TEAMS.forEach(t => {
  TEXT_FLAGS[t.name] = t.fifa;
  TEXT_FLAGS[t.name_en] = t.fifa;
});

function getFifaCode(team: string): string {
  const info = getTeamInfo(team);
  return info?.fifa || team.slice(0, 3).toUpperCase();
}

function getTextFlag(team: string): string {
  return TEXT_FLAGS[team] || team.slice(0, 3).toUpperCase();
}

// ── Simple hash for verification ───────────────────────────────────
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

// ── Phase labels ──────────────────────────────────────────────────
const PHASE_LABELS: Record<string, string> = {
  round_of_32: "R32",
  round_of_16: "OCT",
  quarterfinals: "CUAR",
  semifinals: "SEMI",
  final_3rd: "3ER",
  final: "FIN",
};

// ── Thermal (80mm) styles — B&W, compact ──────────────────────────
const THERMAL_WIDTH = "80mm";

const S = StyleSheet.create({
  page: {
    width: THERMAL_WIDTH,
    padding: "2mm 3mm",
    fontFamily: "Courier",
    fontSize: 7.5,
    lineHeight: 1.3,
    color: "#000",
    backgroundColor: "#fff",
  },
  // ── Header ──
  header: {
    textAlign: "center",
    marginBottom: 4,
    paddingBottom: 4,
    borderBottom: "1pt solid #000",
  },
  logo: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica",
  },
  logoImg: {
    width: 160,
    height: 50,
    alignSelf: "center",
    marginBottom: 2,
    objectFit: "contain",
  },
  headerSub: {
    fontSize: 6,
    marginTop: 1,
  },
  // ── User info ──
  userInfo: {
    marginBottom: 4,
    paddingBottom: 2,
    borderBottom: "1pt dashed #999",
  },
  userLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
  },
  metaLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6,
    color: "#666",
    marginTop: 1,
  },
  // ── Section title ──
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 2,
    paddingVertical: 1,
    borderTop: "0.5pt solid #000",
    borderBottom: "0.5pt solid #000",
  },
  // ── Column headers ──
  colHeader: {
    flexDirection: "row",
    fontSize: 5.5,
    color: "#666",
    marginBottom: 1,
  },
  // ── Match row (compact, one line each) ──
  matchRow: {
    flexDirection: "row",
    fontSize: 7,
    paddingVertical: 0.5,
  },
  matchNum: { width: "6%" },
  matchGroup: { width: "7%", fontSize: 6, color: "#666" },
  matchHome: { width: "14%", textAlign: "right" as const, fontSize: 7 },
  matchVs: { width: "5%", textAlign: "center" as const, fontSize: 6 },
  matchAway: { width: "14%", fontSize: 7 },
  matchPred: { width: "14%", textAlign: "right" as const, fontSize: 7 },
  matchPts: { width: "16%", textAlign: "center" as const, fontSize: 7, color: "#999" },
  matchReal: { width: "24%", textAlign: "center" as const, fontSize: 7, color: "#999" },
  // ── Summary ──
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
    marginBottom: 1,
    fontSize: 6.5,
  },
  // ── Footer ──
  footer: {
    marginTop: 6,
    paddingTop: 3,
    borderTop: "1pt solid #000",
    textAlign: "center",
    fontSize: 5.5,
    color: "#666",
  },
  footerHash: {
    fontSize: 6,
    fontFamily: "Courier",
    marginTop: 2,
    color: "#000",
  },
  // ── Empty ──
  empty: {
    fontSize: 6.5,
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginVertical: 3,
  },
});

// ── Types ─────────────────────────────────────────────────────────
interface UserPrediction {
  prediction: Prediction;
  match: Match;
}

interface PdfBoletoProps {
  userName: string;
  userPhone: string;
  playerSlug: string;
  predictions: UserPrediction[];
  allMatches: Match[];
  logoUrl?: string | null;
}

interface PrecomputedMatch {
  id: string;
  flag: string;
  home: string;
  homeFifa: string;
  away: string;
  awayFifa: string;
  group: string;
  phase: string;
  homeReal: number | null;
  awayReal: number | null;
  isLocked: boolean;
}

function precomputeMatches(allMatches: Match[]): PrecomputedMatch[] {
  return allMatches.map((m) => ({
    id: m.id,
    flag: getTextFlag(m.home_team),
    home: getTeamInfo(m.home_team)?.name || m.home_team,
    homeFifa: getFifaCode(m.home_team),
    away: getTeamInfo(m.away_team)?.name || m.away_team,
    awayFifa: getFifaCode(m.away_team),
    group: m.group_name || PHASE_LABELS[m.phase] || m.phase,
    phase: m.phase,
    homeReal: m.home_score_real,
    awayReal: m.away_score_real,
    isLocked: m.is_locked,
  }));
}

function buildPredMap(predictions: UserPrediction[]): Map<string, Prediction> {
  return new Map(predictions.map((p) => [p.match.id, p.prediction]));
}

const POINTS_BOX = "[  ]";
const SCORE_BOX = "[  ]-[  ]";

function ParticipantPage({
  userName,
  userPhone,
  playerSlug,
  predictions,
  allMatches,
  logoUrl,
  isMassExport,
  exportTime,
}: PdfBoletoProps & { isMassExport?: boolean; exportTime?: string }) {
  const player = getPlayer(playerSlug);
  const preMatches = precomputeMatches(allMatches);
  const predMap = buildPredMap(predictions);

  const groups = preMatches.filter((m) => m.phase === "groups");
  const elims = preMatches.filter((m) => m.phase !== "groups");

  const groupsPreds = groups.filter((m) => predMap.has(m.id)).length;
  const elimsPreds = elims.filter((m) => predMap.has(m.id)).length;

  const hashInput = JSON.stringify(
    predictions.map((p) => ({
      m: p.match.id,
      h: p.prediction.home_score_pred,
      a: p.prediction.away_score_pred,
    }))
  );
  const hash = simpleHash(hashInput + userName + userPhone);
  const now = exportTime || new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });

  return (
    <Page size={{ width: THERMAL_WIDTH, height: "400mm" }} style={S.page}>
      {/* ══ HEADER ══ */}
      <View style={S.header}>
        {logoUrl ? (
          <Image src={logoUrl} style={S.logoImg} />
        ) : (
          <Text style={S.logo}>LA POLLA DEL PONCE</Text>
        )}
        <Text style={S.headerSub}>
          {isMassExport ? "EXPORTACION MASIVA - BOLETO OFICIAL" : "BOLETO DE PREDICCIONES"}
        </Text>
      </View>

      {/* ══ USER ══ */}
      <View style={S.userInfo}>
        <View style={S.userLine}>
          <Text>
            {player?.name || ""} {userName}
          </Text>
          <Text>{userPhone}</Text>
        </View>
        <View style={S.metaLine}>
          <Text>{now}</Text>
          <Text>
            {groupsPreds + elimsPreds}/{allMatches.length}
          </Text>
        </View>
      </View>

      {/* ══ GROUPS ══ */}
      <Text style={S.sectionTitle}>FASE DE GRUPOS</Text>
      <View style={S.colHeader}>
        <Text style={S.matchNum}>N°</Text>
        <Text style={S.matchGroup}>GRP</Text>
        <Text style={S.matchHome}>LOCAL</Text>
        <Text style={S.matchVs}> </Text>
        <Text style={S.matchAway}>VISIT</Text>
        <Text style={S.matchPred}>PRED</Text>
        <Text style={S.matchPts}>PTS</Text>
        <Text style={S.matchReal}>REAL</Text>
      </View>
      {groups.length === 0 ? (
        <Text style={S.empty}>Sin partidos de grupos</Text>
      ) : (
        groups.map((m, i) => (
          <View key={m.id} style={S.matchRow} wrap={false}>
            <Text style={S.matchNum}>{String(i + 1).padStart(2)}</Text>
            <Text style={S.matchGroup}>{m.group}</Text>
            <Text style={S.matchHome}>{m.homeFifa}</Text>
            <Text style={S.matchVs}>v</Text>
            <Text style={S.matchAway}>{m.awayFifa}</Text>
            <Text style={S.matchPred}>
              {predMap.has(m.id)
                ? `${predMap.get(m.id)!.home_score_pred}-${predMap.get(m.id)!.away_score_pred}`
                : " - "}
            </Text>
            <Text style={S.matchPts}>{POINTS_BOX}</Text>
            <Text style={S.matchReal}>{SCORE_BOX}</Text>
          </View>
        ))
      )}

      {/* ══ KNOCKOUTS ══ */}
      <Text style={S.sectionTitle}>ELIMINATORIAS</Text>
      <View style={S.colHeader}>
        <Text style={S.matchNum}>N°</Text>
        <Text style={S.matchGroup}>FASE</Text>
        <Text style={S.matchHome}>LOCAL</Text>
        <Text style={S.matchVs}> </Text>
        <Text style={S.matchAway}>VISIT</Text>
        <Text style={S.matchPred}>PRED</Text>
        <Text style={S.matchPts}>PTS</Text>
        <Text style={S.matchReal}>REAL</Text>
      </View>
      {elims.length === 0 ? (
        <Text style={S.empty}>A determinar al finalizar grupos</Text>
      ) : (
        elims.map((m, i) => (
          <View key={m.id} style={S.matchRow} wrap={false}>
            <Text style={S.matchNum}>{String(groups.length + i + 1).padStart(2)}</Text>
            <Text style={S.matchGroup}>{m.group}</Text>
            <Text style={S.matchHome}>{m.homeFifa}</Text>
            <Text style={S.matchVs}>v</Text>
            <Text style={S.matchAway}>{m.awayFifa}</Text>
            <Text style={S.matchPred}>
              {predMap.has(m.id)
                ? `${predMap.get(m.id)!.home_score_pred}-${predMap.get(m.id)!.away_score_pred}`
                : " - "}
            </Text>
            <Text style={S.matchPts}>{POINTS_BOX}</Text>
            <Text style={S.matchReal}>{SCORE_BOX}</Text>
          </View>
        ))
      )}

      {/* ══ Legend ══ */}
      <View style={{ marginTop: 6, fontSize: 5.5, color: "#666", lineHeight: 1.4 }}>
        <Text>PTS: Anota los puntos que ganaste (5, 3, 2 o 0)</Text>
        <Text>REAL: Anota el marcador real del partido (ej: 2-1)</Text>
      </View>

      {/* ══ SUMMARY ══ */}
      <View style={S.summaryRow}>
        <Text>Grupos: {groupsPreds}/{groups.length}</Text>
        <Text>Elim: {elimsPreds}/{elims.length}</Text>
        <Text>Total: {groupsPreds + elimsPreds}/{allMatches.length}</Text>
      </View>

      {/* ══ FOOTER ══ */}
      <View style={S.footer}>
        <Text>Documento oficial - La Polla del Ponce</Text>
        <Text>Las predicciones se cierran al iniciar el torneo.</Text>
        <Text style={S.footerHash}>#{hash}</Text>
      </View>
    </Page>
  );
}

// ── Main PDF (individual boleto) ──────────────────────────────────
export default function PdfBoleto(props: PdfBoletoProps) {
  return (
    <Document>
      <ParticipantPage {...props} />
    </Document>
  );
}

// ── Mass export (one page/participant) ────────────────────────────
interface MassExportProps {
  data: {
    exported_at: string;
    users: {
      user: { id: string; name: string; phone: string; player_slug: string };
      predictions: UserPrediction[];
    }[];
    matches: Match[];
  };
  logoUrl?: string | null;
}

export function PdfMassExport({ data, logoUrl }: MassExportProps) {
  return (
    <Document>
      {data.users.map((u) => (
        <ParticipantPage
          key={u.user.id}
          userName={u.user.name}
          userPhone={u.user.phone}
          playerSlug={u.user.player_slug}
          predictions={u.predictions}
          allMatches={data.matches}
          logoUrl={logoUrl}
          isMassExport
          exportTime={data.exported_at}
        />
      ))}
    </Document>
  );
}
