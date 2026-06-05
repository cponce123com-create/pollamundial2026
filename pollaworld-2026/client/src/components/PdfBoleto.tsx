import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Match, Prediction } from "../lib/api";
import { getEmoji } from "../lib/emojis";

// ── Text flags (reliable in PDF vs emoji) ──────────────────────────
const TEXT_FLAGS: Record<string, string> = {
  México: "MEX",
  Sudáfrica: "RSA",
  "Corea del Sur": "KOR",
  "República Checa": "CZE",
  Canadá: "CAN",
  "Bosnia y Herzegovina": "BIH",
  Catar: "QAT",
  Suiza: "SUI",
  Brasil: "BRA",
  Marruecos: "MAR",
  Haití: "HAI",
  Escocia: "SCO",
  "Estados Unidos": "USA",
  Paraguay: "PAR",
  Australia: "AUS",
  Turquía: "TUR",
  Alemania: "GER",
  Curazao: "CUW",
  "Costa de Marfil": "CIV",
  Ecuador: "ECU",
  "Países Bajos": "NED",
  Japón: "JPN",
  Suecia: "SWE",
  Túnez: "TUN",
  Bélgica: "BEL",
  Egipto: "EGY",
  Irán: "IRN",
  "Nueva Zelanda": "NZL",
  España: "ESP",
  "Cabo Verde": "CPV",
  "Arabia Saudita": "KSA",
  Uruguay: "URU",
  Francia: "FRA",
  Senegal: "SEN",
  Irak: "IRQ",
  Noruega: "NOR",
  Argentina: "ARG",
  Argelia: "ALG",
  Austria: "AUT",
  Jordania: "JOR",
  Portugal: "POR",
  "República Democrática del Congo": "COD",
  Uzbekistán: "UZB",
  Colombia: "COL",
  Inglaterra: "ENG",
  Croacia: "CRO",
  Ghana: "GHA",
  Panamá: "PAN",
};

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
  round_of_32: "Ronda de 32",
  round_of_16: "Octavos",
  quarterfinals: "Cuartos",
  semifinals: "Semis",
  final_3rd: "3er Puesto",
  final: "Final",
};

const STYLES = StyleSheet.create({
  page: {
    backgroundColor: "#0d1117",
    color: "#f5f5f5",
    fontFamily: "Helvetica",
    padding: 28,
    fontSize: 9,
  },
  // ── Header ──
  header: {
    borderBottom: "2pt solid #1a6e3c",
    paddingBottom: 10,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: { fontSize: 16, fontWeight: "bold", color: "#f0a500" },
  subtitle: { fontSize: 7, color: "#8b949e", marginTop: 2 },
  userBlock: { alignItems: "flex-end" },
  userName: { fontSize: 10, color: "#f5f5f5" },
  userPhone: { fontSize: 8, color: "#8b949e" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  metaText: { fontSize: 6.5, color: "#6e7681" },
  hashText: { fontSize: 6.5, color: "#6e7681", fontFamily: "Courier" },

  // ── Section titles ──
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#f0a500",
    backgroundColor: "#161b22",
    padding: "5 8",
    marginBottom: 6,
    marginTop: 12,
  },

  // ── Table ──
  table: { marginBottom: 4 },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1pt solid #1a6e3c",
    paddingVertical: 3,
    backgroundColor: "#161b22",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #30363d",
    paddingVertical: 3,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #30363d",
    paddingVertical: 3,
    backgroundColor: "#0d1117",
  },
  // Column defs: index(0.3), flag(0.6), vs(0.2), flag(0.6), group(0.5), date(1), pred(0.8)
  colNum: { width: "3%" },
  colNumText: { fontSize: 7, color: "#6e7681" },
  colTeam: { width: "16%" },
  colTeamText: { fontSize: 8, color: "#f5f5f5" },
  colVs: { width: "4%", alignItems: "center" as const },
  colVsText: { fontSize: 7, color: "#6e7681" },
  colFlag: { width: "7%" },
  colFlagText: { fontSize: 6, color: "#8b949e", fontFamily: "Courier" },
  colGroup: { width: "10%" },
  colGroupText: { fontSize: 7, color: "#8b949e" },
  colDate: { width: "22%" },
  colDateText: { fontSize: 7, color: "#8b949e" },
  colPred: { width: "10%", alignItems: "center" as const },
  colPredText: { fontSize: 9, color: "#f0a500", fontWeight: "bold" },
  colHeaderText: { fontSize: 7, color: "#8b949e", fontWeight: "bold" },
  colPredNone: { fontSize: 8, color: "#6e7681" },
  colResult: { width: "12%", alignItems: "center" as const },
  colResultText: { fontSize: 7, color: "#3fb950" },
  colPhase: { width: "10%" },
  colPhaseText: { fontSize: 7, color: "#f0a500" },

  // ── Empty state ──
  empty: { fontSize: 8, color: "#6e7681", fontStyle: "italic", padding: 6 },

  // ── Summary bar ──
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  summaryItem: {
    backgroundColor: "#161b22",
    padding: "4 8",
    borderRadius: 2,
  },
  summaryLabel: { fontSize: 6.5, color: "#8b949e" },
  summaryValue: { fontSize: 10, color: "#f0a500", fontWeight: "bold" },

  // ── Footer ──
  footer: {
    marginTop: 20,
    borderTop: "1pt solid #30363d",
    paddingTop: 8,
    alignItems: "center",
  },
  footerText: { fontSize: 6.5, color: "#6e7681", textAlign: "center", marginBottom: 1 },
  footerHash: { fontSize: 7, color: "#f0a500", fontFamily: "Courier", marginTop: 3 },
});

// ── Types ─────────────────────────────────────────────────────────
interface UserPrediction {
  prediction: Prediction;
  match: Match;
}

interface PdfBoletoProps {
  userName: string;
  userPhone: string;
  emojiId: string;
  predictions: UserPrediction[];
  allMatches: Match[];
}

interface PrecomputedMatch {
  id: string;
  flagH: string;
  flagA: string;
  home: string;
  away: string;
  group: string;
  phase: string;
  date: string;
  homeReal: number | null;
  awayReal: number | null;
}

function precomputeMatches(allMatches: Match[]): PrecomputedMatch[] {
  return allMatches.map((m) => ({
    id: m.id,
    flagH: getTextFlag(m.home_team),
    flagA: getTextFlag(m.away_team),
    home: m.home_team,
    away: m.away_team,
    group: m.group_name || PHASE_LABELS[m.phase] || m.phase,
    phase: m.phase,
    date: new Date(m.match_date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    homeReal: m.home_score_real,
    awayReal: m.away_score_real,
  }));
}

function buildPredMap(predictions: UserPrediction[]): Map<string, Prediction> {
  return new Map(predictions.map((p) => [p.match.id, p.prediction]));
}

function countPreds(predMap: Map<string, Prediction>, matchIds: string[]): number {
  return matchIds.filter((id) => predMap.has(id)).length;
}

// ── Match table row ────────────────────────────────────────────────
function MatchRow({
  match,
  pred,
  idx,
  showPhase,
}: {
  match: PrecomputedMatch;
  pred: Prediction | undefined;
  idx: number;
  showPhase: boolean;
}) {
  const isAlt = idx % 2 === 0;
  return (
    <View style={isAlt ? STYLES.tableRowAlt : STYLES.tableRow} wrap={false}>
      <View style={STYLES.colNum}>
        <Text style={STYLES.colNumText}>{idx + 1}</Text>
      </View>
      {showPhase ? (
        <View style={STYLES.colPhase}>
          <Text style={STYLES.colPhaseText}>{match.group}</Text>
        </View>
      ) : (
        <View style={STYLES.colGroup}>
          <Text style={STYLES.colGroupText}>{match.group}</Text>
        </View>
      )}
      <View style={STYLES.colFlag}>
        <Text style={STYLES.colFlagText}>{match.flagH}</Text>
      </View>
      <View style={STYLES.colTeam}>
        <Text style={STYLES.colTeamText}>{match.home}</Text>
      </View>
      <View style={STYLES.colVs}>
        <Text style={STYLES.colVsText}>vs</Text>
      </View>
      <View style={STYLES.colTeam}>
        <Text style={STYLES.colTeamText}>{match.away}</Text>
      </View>
      <View style={STYLES.colFlag}>
        <Text style={STYLES.colFlagText}>{match.flagA}</Text>
      </View>
      <View style={STYLES.colDate}>
        <Text style={STYLES.colDateText}>{match.date}</Text>
      </View>
      <View style={STYLES.colPred}>
        {pred ? (
          <Text style={STYLES.colPredText}>
            {pred.home_score_pred}-{pred.away_score_pred}
          </Text>
        ) : (
          <Text style={STYLES.colPredNone}>—</Text>
        )}
      </View>
      <View style={STYLES.colResult}>
        {match.homeReal !== null ? (
          <Text style={STYLES.colResultText}>
            {match.homeReal}-{match.awayReal}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ── Table header ──────────────────────────────────────────────────
function MatchTableHeader({ showPhase }: { showPhase: boolean }) {
  // Use string union for headerText
  const H = (s: string) => (
    <Text style={STYLES.colHeaderText}>{s}</Text>
  );
  return (
    <View style={STYLES.tableHeader} wrap={false}>
      <View style={STYLES.colNum}>{H("#")}</View>
      {showPhase ? (
        <View style={STYLES.colPhase}>{H("Fase")}</View>
      ) : (
        <View style={STYLES.colGroup}>{H("Grupo")}</View>
      )}
      <View style={STYLES.colFlag}>{H("")}</View>
      <View style={STYLES.colTeam}>{H("Local")}</View>
      <View style={STYLES.colVs}>{H("")}</View>
      <View style={STYLES.colTeam}>{H("Visita")}</View>
      <View style={STYLES.colFlag}>{H("")}</View>
      <View style={STYLES.colDate}>{H("Fecha")}</View>
      <View style={STYLES.colPred}>{H("Pronóstico")}</View>
      <View style={STYLES.colResult}>{H("Resultado")}</View>
    </View>
  );
}

// ── Main PDF component ────────────────────────────────────────────
export default function PdfBoleto({
  userName,
  userPhone,
  emojiId,
  predictions,
  allMatches,
}: PdfBoletoProps) {
  const emoji = getEmoji(emojiId);

  // Pre-compute data
  const preMatches = precomputeMatches(allMatches);
  const predMap = buildPredMap(predictions);

  const groupsData = preMatches.filter((m) => m.phase === "groups");
  const elimData = preMatches.filter((m) => m.phase !== "groups");

  const groupsCount = countPreds(predMap, groupsData.map((m) => m.id));
  const elimCount = countPreds(predMap, elimData.map((m) => m.id));
  const totalCount = groupsCount + elimCount;

  // Build verification hash
  const hashInput = JSON.stringify(
    predictions.map((p) => ({
      m: p.match.id,
      h: p.prediction.home_score_pred,
      a: p.prediction.away_score_pred,
    }))
  );
  const hash = simpleHash(hashInput + userName + userPhone);

  const now = new Date().toLocaleString("es-PE", {
    timeZone: "America/Lima",
  });

  return (
    <Document>
      <Page size="A4" style={STYLES.page}>
        {/* ── HEADER ── */}
        <View style={STYLES.header}>
          <View style={STYLES.headerRow}>
            <View>
              <Text style={STYLES.logo}>⚽ PollaWorld 2026</Text>
              <Text style={STYLES.subtitle}>
                BOLETO DE PREDICCIONES — COMPROBANTE OFICIAL
              </Text>
            </View>
            <View style={STYLES.userBlock}>
              <Text style={STYLES.userName}>
                {emoji?.emoji} {userName}
              </Text>
              <Text style={STYLES.userPhone}>📱 {userPhone}</Text>
            </View>
          </View>
          <View style={STYLES.metaRow}>
            <Text style={STYLES.metaText}>Generado: {now}</Text>
            <Text style={STYLES.hashText}>Hash: {hash}</Text>
          </View>
        </View>

        {/* ── SUMMARY ── */}
        <View style={STYLES.summaryRow}>
          <View style={STYLES.summaryItem}>
            <Text style={STYLES.summaryLabel}>Predichos</Text>
            <Text style={STYLES.summaryValue}>
              {totalCount}/{allMatches.length}
            </Text>
          </View>
          <View style={STYLES.summaryItem}>
            <Text style={STYLES.summaryLabel}>Grupos</Text>
            <Text style={STYLES.summaryValue}>
              {groupsCount}/{groupsData.length}
            </Text>
          </View>
          <View style={STYLES.summaryItem}>
            <Text style={STYLES.summaryLabel}>Eliminatorias</Text>
            <Text style={STYLES.summaryValue}>
              {elimCount}/{elimData.length}
            </Text>
          </View>
        </View>

        {/* ── FASE DE GRUPOS ── */}
        <Text style={STYLES.sectionTitle}>FASE DE GRUPOS</Text>
        {groupsData.length === 0 ? (
          <Text style={STYLES.empty}>
            No hay partidos de fase de grupos registrados.
          </Text>
        ) : (
          <View style={STYLES.table}>
            <MatchTableHeader showPhase={false} />
            {groupsData.map((m, i) => (
              <MatchRow
                key={m.id}
                match={m}
                pred={predMap.get(m.id)}
                idx={i}
                showPhase={false}
              />
            ))}
          </View>
        )}

        {/* ── FASE ELIMINATORIA ── */}
        <Text style={STYLES.sectionTitle}>FASE ELIMINATORIA</Text>
        {elimData.length === 0 ? (
          <Text style={STYLES.empty}>
            Los partidos de eliminación se definirán al finalizar los grupos.
          </Text>
        ) : (
          <View style={STYLES.table}>
            <MatchTableHeader showPhase={true} />
            {elimData.map((m, i) => (
              <MatchRow
                key={m.id}
                match={m}
                pred={predMap.get(m.id)}
                idx={i}
                showPhase={true}
              />
            ))}
          </View>
        )}

        {/* ── FOOTER ── */}
        <View style={STYLES.footer}>
          <Text style={STYLES.footerText}>
            Documento generado el {now}. Sirve como constancia oficial de tus
            predicciones para PollaWorld 2026.
          </Text>
          <Text style={STYLES.footerText}>
            Las predicciones se cierran al iniciar el torneo. Los resultados se
            actualizan automáticamente.
          </Text>
          <Text style={STYLES.footerHash}>Hash: {hash}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── MASS EXPORT: optimized — one page per user ──────────────────
// Pre-compute all data once before rendering to avoid per-user recalculation
interface MassExportProps {
  data: {
    exported_at: string;
    users: {
      user: { id: string; name: string; phone: string; emoji_id: string };
      predictions: UserPrediction[];
    }[];
    matches: Match[];
  };
}

export function PdfMassExport({ data }: MassExportProps) {
  // Pre-compute matches once for all users
  const preMatches = precomputeMatches(data.matches);
  const groupsData = preMatches.filter((m) => m.phase === "groups");
  const elimData = preMatches.filter((m) => m.phase !== "groups");

  return (
    <Document>
      {data.users.map((u) => {
        const predMap = buildPredMap(u.predictions);
        // Reuse pre-computed match data per user
        const hashInput = JSON.stringify(
          u.predictions.map((p) => ({
            m: p.match.id,
            h: p.prediction.home_score_pred,
            a: p.prediction.away_score_pred,
          }))
        );
        const hash = simpleHash(hashInput + u.user.name + u.user.phone);
        const emoji = getEmoji(u.user.emoji_id);
        const now = new Date(data.exported_at).toLocaleString("es-PE", {
          timeZone: "America/Lima",
        });
        const totalPreds = u.predictions.length;

        return (
          <Page key={u.user.id} size="A4" style={STYLES.page}>
            {/* ── HEADER ── */}
            <View style={STYLES.header}>
              <View style={STYLES.headerRow}>
                <View>
                  <Text style={STYLES.logo}>⚽ PollaWorld 2026</Text>
                  <Text style={STYLES.subtitle}>
                    EXPORTACIÓN MASIVA — COMPROBANTE OFICIAL
                  </Text>
                </View>
                <View style={STYLES.userBlock}>
                  <Text style={STYLES.userName}>
                    {emoji?.emoji} {u.user.name}
                  </Text>
                  <Text style={STYLES.userPhone}>📱 {u.user.phone}</Text>
                </View>
              </View>
              <View style={STYLES.metaRow}>
                <Text style={STYLES.metaText}>
                  Exportado: {now} | Predicciones: {totalPreds}/
                  {data.matches.length}
                </Text>
                <Text style={STYLES.hashText}>Hash: {hash}</Text>
              </View>
            </View>

            {/* ── GRUPOS ── */}
            <Text style={STYLES.sectionTitle}>FASE DE GRUPOS</Text>
            {groupsData.length === 0 ? (
              <Text style={STYLES.empty}>
                No hay partidos de fase de grupos.
              </Text>
            ) : (
              <View style={STYLES.table}>
                <MatchTableHeader showPhase={false} />
                {groupsData.map((m, i) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    pred={predMap.get(m.id)}
                    idx={i}
                    showPhase={false}
                  />
                ))}
              </View>
            )}

            {/* ── ELIMINATORIAS ── */}
            <Text style={STYLES.sectionTitle}>FASE ELIMINATORIA</Text>
            {elimData.length === 0 ? (
              <Text style={STYLES.empty}>
                Sin partidos de eliminación registrados.
              </Text>
            ) : (
              <View style={STYLES.table}>
                <MatchTableHeader showPhase={true} />
                {elimData.map((m, i) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    pred={predMap.get(m.id)}
                    idx={i}
                    showPhase={true}
                  />
                ))}
              </View>
            )}

            <View style={STYLES.footer}>
              <Text style={STYLES.footerText}>
                Exportación masiva — {data.users.length} participantes.
                Generado el {now}.
              </Text>
              <Text style={STYLES.footerHash}>Hash: {hash}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
