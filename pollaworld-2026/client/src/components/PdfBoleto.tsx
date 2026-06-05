import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Match, Prediction } from "../lib/api";
import { getEmoji } from "../lib/emojis";

// Simple MD5 hash implementation for verification
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0d1117",
    color: "#f5f5f5",
    fontFamily: "Helvetica",
    padding: 32,
    fontSize: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
    borderBottom: "2pt solid #1a6e3c",
    paddingBottom: 12,
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0a500",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#8b949e",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 4,
  },
  userText: {
    fontSize: 11,
    color: "#f5f5f5",
  },
  hash: {
    fontSize: 7,
    color: "#6e7681",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#f0a500",
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#161b22",
    padding: 6,
    borderRadius: 2,
  },
  table: {
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #30363d",
    paddingVertical: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1pt solid #1a6e3c",
    paddingVertical: 4,
    backgroundColor: "#161b22",
  },
  cellMatch: { flex: 2.5, fontSize: 9, color: "#f5f5f5" },
  cellGroup: { flex: 1, fontSize: 9, color: "#8b949e" },
  cellDate: { flex: 1.5, fontSize: 8, color: "#8b949e" },
  cellPred: { flex: 1.5, fontSize: 9, color: "#f0a500", textAlign: "center" },
  headerCell: { fontSize: 8, color: "#8b949e", fontWeight: "bold" },
  footer: {
    marginTop: 24,
    borderTop: "1pt solid #30363d",
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#6e7681",
    textAlign: "center",
    marginBottom: 2,
  },
  emptyState: {
    fontSize: 9,
    color: "#6e7681",
    fontStyle: "italic",
    padding: 8,
  },
});

interface Props {
  userName: string;
  userPhone: string;
  emojiId: string;
  predictions: { prediction: Prediction; match: Match }[];
  allMatches: Match[];
}

const PHASE_LABELS: Record<string, string> = {
  round_of_16: "Octavos",
  quarterfinals: "Cuartos",
  semifinals: "Semis",
  final: "Final",
};

export default function PdfBoleto({ userName, userPhone, emojiId, predictions, allMatches }: Props) {
  const emoji = getEmoji(emojiId);
  const now = new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });

  // Build hash
  const predsJson = JSON.stringify(predictions.map((p) => ({
    m: p.match.id,
    h: p.prediction.home_score_pred,
    a: p.prediction.away_score_pred,
  })));
  const hash = simpleHash(predsJson + userName + userPhone);

  // Split matches
  const groupsMatches = allMatches.filter((m) => m.phase === "groups");
  const elimMatches = allMatches.filter((m) => m.phase !== "groups");

  const predMap = new Map(predictions.map((p) => [p.match.id, p.prediction]));

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>⚽ PollaWorld 2026</Text>
          <Text style={styles.subtitle}>BOLETO DE PREDICCIONES — COMPROBANTE OFICIAL</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userText}>{emoji?.emoji} {userName}</Text>
            <Text style={styles.userText}>📱 {userPhone}</Text>
          </View>
          <Text style={{ fontSize: 8, color: "#8b949e" }}>Generado: {now}</Text>
          <Text style={styles.hash}>Hash: {hash}</Text>
        </View>

        {/* SECCIÓN 1: GRUPOS */}
        <Text style={styles.sectionTitle}>FASE DE GRUPOS</Text>
        {groupsMatches.length === 0 ? (
          <Text style={styles.emptyState}>No hay partidos de fase de grupos registrados.</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellMatch, styles.headerCell]}>Partido</Text>
              <Text style={[styles.cellGroup, styles.headerCell]}>Grupo</Text>
              <Text style={[styles.cellDate, styles.headerCell]}>Fecha</Text>
              <Text style={[styles.cellPred, styles.headerCell]}>Predicción</Text>
            </View>
            {groupsMatches.map((m) => {
              const pred = predMap.get(m.id);
              return (
                <View style={styles.tableRow} key={m.id}>
                  <Text style={styles.cellMatch}>{m.home_flag} {m.home_team} vs {m.away_team} {m.away_flag}</Text>
                  <Text style={styles.cellGroup}>{m.group_name || "-"}</Text>
                  <Text style={styles.cellDate}>{formatDate(m.match_date)}</Text>
                  <Text style={styles.cellPred}>
                    {pred ? `${pred.home_score_pred} - ${pred.away_score_pred}` : "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* SECCIÓN 2: ELIMINATORIAS */}
        <Text style={styles.sectionTitle}>FASE ELIMINATORIA</Text>
        {elimMatches.length === 0 ? (
          <Text style={styles.emptyState}>Los partidos de eliminación se definirán al finalizar grupos.</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellGroup, styles.headerCell]}>Fase</Text>
              <Text style={[styles.cellMatch, styles.headerCell]}>Partido</Text>
              <Text style={[styles.cellDate, styles.headerCell]}>Fecha</Text>
              <Text style={[styles.cellPred, styles.headerCell]}>Predicción</Text>
            </View>
            {elimMatches.map((m) => {
              const pred = predMap.get(m.id);
              return (
                <View style={styles.tableRow} key={m.id}>
                  <Text style={styles.cellGroup}>{PHASE_LABELS[m.phase] || m.phase}</Text>
                  <Text style={styles.cellMatch}>{m.home_flag} {m.home_team} vs {m.away_team} {m.away_flag}</Text>
                  <Text style={styles.cellDate}>{formatDate(m.match_date)}</Text>
                  <Text style={styles.cellPred}>
                    {pred ? `${pred.home_score_pred} - ${pred.away_score_pred}` : "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este documento fue generado el {now} y sirve como constancia de tus predicciones.
          </Text>
          <Text style={styles.footerText}>
            La participación se cierra al inicio del primer partido del torneo.
          </Text>
          <Text style={{ ...styles.footerText, marginTop: 4, color: "#f0a500" }}>
            Hash de verificación: {hash}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── MASS EXPORT: one page per user ───────────────────────────────
interface MassExportProps {
  data: {
    exported_at: string;
    users: {
      user: { id: string; name: string; phone: string; emoji_id: string };
      predictions: { prediction: Prediction; match: Match }[];
    }[];
    matches: Match[];
  };
}

export function PdfMassExport({ data }: MassExportProps) {
  return (
    <Document>
      {data.users.map((u) => (
        <PdfBoleto
          key={u.user.id}
          userName={u.user.name}
          userPhone={u.user.phone}
          emojiId={u.user.emoji_id}
          predictions={u.predictions}
          allMatches={data.matches}
        />
      ))}
    </Document>
  );
}
