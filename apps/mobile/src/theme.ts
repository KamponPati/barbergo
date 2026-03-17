import { StyleSheet } from "react-native";

// ─── Colour Tokens ────────────────────────────────────────────────────────────
export const palette = {
  // Brand — Customer blue
  brand:      "#2563eb",
  brandDark:  "#1d4ed8",
  brandLight: "#eff6ff",

  // Accent — purple rewards
  accent:     "#9333ea",
  accentLight:"#faf5ff",

  // Neutrals
  bg:         "#f8fafc",
  card:       "#ffffff",
  line:       "#e2e8f0",
  ink:        "#0f172a",
  body:       "#1e293b",
  muted:      "#64748b",
  subtle:     "#94a3b8",

  // Status
  success:    "#16a34a",
  warning:    "#d97706",
  danger:     "#dc2626",

  // Misc
  overlay:    "rgba(15,23,42,0.45)",
  gold:       "#f59e0b",
  silver:     "#94a3b8",
};

// ─── Typography Scale ─────────────────────────────────────────────────────────
export const type = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
};

export const weight = {
  regular: "400" as const,
  medium:  "500" as const,
  semi:    "600" as const,
  bold:    "700" as const,
  black:   "800" as const,
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const space = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
  xxxl:40,
};

// ─── Radius ───────────────────────────────────────────────────────────────────
export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
};

// ─── Shared StyleSheet ────────────────────────────────────────────────────────
export const appStyles = StyleSheet.create({
  // Layout
  safe: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  fill: {
    flex: 1,
  },
  container: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Cards
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.md,
  },
  cardElevated: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // Typography
  eyebrow: {
    fontSize: type.xs,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: palette.brand,
    fontWeight: weight.bold,
  },
  h1: {
    fontSize: type.xxl,
    fontWeight: weight.black,
    color: palette.ink,
    lineHeight: 36,
  },
  h2: {
    fontSize: type.xl,
    fontWeight: weight.bold,
    color: palette.ink,
  },
  h3: {
    fontSize: type.lg,
    fontWeight: weight.semi,
    color: palette.ink,
  },
  h4: {
    fontSize: type.md,
    fontWeight: weight.semi,
    color: palette.ink,
  },
  body: {
    fontSize: type.base,
    color: palette.body,
    lineHeight: 22,
  },
  caption: {
    fontSize: type.sm,
    color: palette.muted,
    lineHeight: 18,
  },
  tiny: {
    fontSize: type.xs,
    color: palette.subtle,
  },

  // Buttons
  btn: {
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: space.xl,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: palette.brand,
  },
  btnSecondary: {
    backgroundColor: palette.brandLight,
  },
  btnDanger: {
    backgroundColor: palette.danger,
  },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: palette.line,
  },
  btnText: {
    color: "#fff",
    fontWeight: weight.bold,
    fontSize: type.base,
  },
  btnTextSecondary: {
    color: palette.brand,
    fontWeight: weight.bold,
    fontSize: type.base,
  },
  btnTextGhost: {
    color: palette.ink,
    fontWeight: weight.semi,
    fontSize: type.base,
  },
  btnSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  btnSmText: {
    fontSize: type.sm,
  },
  btnDisabled: {
    opacity: 0.45,
  },

  // Input
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: type.base,
    color: palette.ink,
    backgroundColor: palette.card,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: palette.brand,
  },
  inputLabel: {
    fontSize: type.sm,
    fontWeight: weight.semi,
    color: palette.body,
    marginBottom: 4,
  },

  // Badge / pill
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgePrimary: {
    backgroundColor: palette.brandLight,
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeWarning: {
    backgroundColor: "#fef3c7",
  },
  badgeDanger: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: type.xs,
    fontWeight: weight.bold,
  },
  badgeTextPrimary: {
    color: palette.brand,
  },
  badgeTextSuccess: {
    color: palette.success,
  },
  badgeTextWarning: {
    color: palette.warning,
  },
  badgeTextDanger: {
    color: palette.danger,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: palette.line,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  statTile: {
    flexGrow: 1,
    minWidth: "45%",
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.md,
    padding: space.md,
    gap: 2,
  },
  statLabel: {
    fontSize: type.xs,
    color: palette.muted,
  },
  statValue: {
    fontSize: type.lg,
    fontWeight: weight.black,
    color: palette.ink,
  },

  // Misc
  error: {
    color: palette.danger,
    fontSize: type.sm,
  },
  section: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.md,
    gap: space.sm,
  },
  sectionTitle: {
    fontSize: type.md,
    fontWeight: weight.bold,
    color: palette.ink,
  },

  // ── Legacy scaffold aliases (kept for backward-compat with old screen stubs) ─
  codeWrap: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 10,
  },
  code: {
    color: "#e2e8f0",
    fontSize: 11,
    fontFamily: "monospace",
  },
  pillRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.card,
  },
  pillActive: {
    borderColor: palette.brand,
    backgroundColor: palette.brandLight,
  },
  pillText: {
    color: palette.ink,
    fontSize: 12,
  },
  cardTitle: {
    fontWeight: "700" as const,
    color: palette.ink,
    fontSize: 13,
  },
  cardMeta: {
    color: "#334155",
    fontSize: 12,
  },
});
