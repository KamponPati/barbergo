import { MvpCoreService } from "../src/common/services/mvp-core.service";

describe("Phase 4 scale controls", () => {
  let service: MvpCoreService;

  beforeEach(() => {
    service = new MvpCoreService();
  });

  it("evaluates zone gates and keeps failing zones on hold", () => {
    const evaluation = service.evaluateZoneGates();

    const central = evaluation.data.find((row) => row.zone_id === "central-a");
    const west = evaluation.data.find((row) => row.zone_id === "west-b");

    expect(central?.decision).toBe("approved");
    expect(west?.decision).toBe("hold");
    expect(west?.reasons.length).toBeGreaterThan(0);
  });

  it("estimates dynamic pricing from matching rules", () => {
    const result = service.estimateDynamicPrice({
      zone_id: "central-a",
      base_price: 500,
      hour: 19,
      demand_supply_ratio: 1.3
    });

    expect(result.multiplier).toBe(1.15);
    expect(result.final_price).toBe(575);
  });

  it("calculates payout risk profile and policy", () => {
    const risk = service.evaluatePayoutRisk({
      dispute_rate: 0.05,
      refund_rate: 0.04,
      cancellation_rate: 0.07,
      chargeback_rate: 0.01
    });

    expect(risk.risk_profile).toBe("medium");
    expect(risk.holdback_rate).toBeGreaterThan(0);
  });

  it("triages disputes with automation rules", () => {
    const lowValueNoShow = service.triageDispute({
      dispute_type: "no_show",
      amount: 250,
      evidence_score: 0.9,
      evidence_count: 2,
      abuse_count_30d: 0
    });

    expect(lowValueNoShow.action).toBe("auto_refund");
    expect(lowValueNoShow.escalation_required).toBe(false);

    const abuseCase = service.triageDispute({
      dispute_type: "quality",
      amount: 500,
      evidence_score: 0.7,
      evidence_count: 1,
      abuse_count_30d: 3
    });

    expect(abuseCase.action).toBe("temporary_suspension");
    expect(abuseCase.escalation_required).toBe(true);
  });

  it("returns zone-level unit economics trend", () => {
    const trend = service.getUnitEconomicsTrend();

    expect(trend.data.length).toBeGreaterThanOrEqual(2);
    const central = trend.data.find((row) => row.zone_id === "central-a");
    expect(central?.contribution_per_booking).toBeGreaterThan(0);
  });
});
