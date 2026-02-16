import { StyleSheet } from "react-native";

export const palette = {
  bg: "#f8fafc",
  card: "#ffffff",
  line: "#cbd5e1",
  ink: "#0f172a",
  muted: "#475569",
  brand: "#0f766e",
  danger: "#b91c1c",
  codeBg: "#0f172a",
  codeText: "#e2e8f0"
};

export const appStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg
  },
  container: {
    padding: 14,
    gap: 12
  },
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.brand,
    fontWeight: "700"
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.ink
  },
  subtitle: {
    color: palette.muted
  },
  section: {
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.ink
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  button: {
    backgroundColor: palette.brand,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    minWidth: 84,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonPressed: {
    opacity: 0.85
  },
  buttonDisabled: {
    opacity: 0.45
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  meta: {
    color: "#334155",
    fontSize: 12
  },
  error: {
    color: palette.danger,
    fontSize: 12
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  statTile: {
    flexGrow: 1,
    minWidth: "45%",
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12
  },
  statValue: {
    color: palette.ink,
    fontWeight: "800",
    marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: palette.ink
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  pill: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.card
  },
  pillActive: {
    borderColor: palette.brand,
    backgroundColor: "#ecfeff"
  },
  pillText: {
    color: palette.ink,
    fontSize: 12
  },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 10,
    backgroundColor: palette.card
  },
  cardTitle: {
    fontWeight: "700",
    color: palette.ink,
    fontSize: 13
  },
  cardMeta: {
    color: "#334155",
    fontSize: 12
  },
  codeWrap: {
    backgroundColor: palette.codeBg,
    borderRadius: 12,
    padding: 10
  },
  code: {
    color: palette.codeText,
    fontSize: 11,
    fontFamily: "monospace"
  }
});
