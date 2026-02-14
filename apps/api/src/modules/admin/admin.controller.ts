import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuditLogService } from "../../common/services/audit-log.service";
import { DbCoreService } from "../../common/services/db-core.service";
import { MvpCoreService } from "../../common/services/mvp-core.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly dbCoreService: DbCoreService,
    private readonly mvpCoreService: MvpCoreService
  ) {}

  @Get("audit/logs")
  async getAuditLogs(): Promise<{ data: Awaited<ReturnType<AuditLogService["list"]>> }> {
    return {
      data: await this.auditLogService.list()
    };
  }

  @Post("partners/:partnerId/verification")
  setPartnerVerification(
    @Param("partnerId") partnerId: string,
    @Body() body: { action: "approve" | "reject" }
  ) {
    return this.dbCoreService.adminSetPartnerVerification({
      partner_id: partnerId,
      action: body.action
    });
  }

  @Get("disputes")
  listDisputes() {
    return this.dbCoreService.listDisputes();
  }

  @Post("disputes/:disputeId/resolve")
  resolveDispute(
    @Param("disputeId") disputeId: string,
    @Body() body: { action: string; note: string }
  ) {
    return this.dbCoreService.resolveDispute({
      dispute_id: disputeId,
      action: body.action,
      note: body.note
    });
  }

  @Get("policy")
  policy() {
    return this.mvpCoreService.getPolicy();
  }

  @Put("policy")
  updatePolicy(
    @Body()
    body: {
      commission_rate?: number;
      cancellation_fee_rate?: number;
      pricing_multiplier?: number;
      promo_enabled?: boolean;
    }
  ) {
    return this.mvpCoreService.setPolicy(body);
  }

  @Get("roles")
  roleMatrix() {
    return this.mvpCoreService.getRolePermissionMatrix();
  }

  @Put("roles/:role/permissions")
  setRolePermissions(@Param("role") role: string, @Body() body: { permissions: string[] }) {
    return this.mvpCoreService.setRolePermissions(role, body.permissions);
  }

  @Get("analytics/overview")
  analyticsOverview() {
    return this.mvpCoreService.getAnalyticsOverview();
  }

  @Get("analytics/advanced")
  advancedAnalytics() {
    return this.mvpCoreService.getAdvancedAnalytics();
  }

  @Get("scale/coverage-gates")
  coverageGates() {
    return this.mvpCoreService.getCoverageGates();
  }

  @Get("scale/zone-kpis")
  zoneKpis() {
    return this.mvpCoreService.getZoneKpiSnapshots();
  }

  @Get("scale/zone-gates/evaluate")
  evaluateZoneGates() {
    return this.mvpCoreService.evaluateZoneGates();
  }

  @Put("scale/coverage-gates/:zoneId")
  setCoverageZoneStatus(
    @Param("zoneId") zoneId: string,
    @Body() body: { status: "approved_for_expansion" | "hold"; hold_reason?: string }
  ) {
    return this.mvpCoreService.setCoverageZoneStatus({
      zone_id: zoneId,
      status: body.status,
      hold_reason: body.hold_reason
    });
  }

  @Get("scale/delivery-readiness")
  deliveryReadiness() {
    return this.mvpCoreService.getDeliveryReadiness();
  }

  @Put("scale/delivery/:zoneId")
  setDeliveryMode(
    @Param("zoneId") zoneId: string,
    @Body() body: { enabled: boolean; decision: "approved" | "blocked" | "pending" }
  ) {
    return this.mvpCoreService.setDeliveryMode({
      zone_id: zoneId,
      enabled: body.enabled,
      decision: body.decision
    });
  }

  @Get("scale/dynamic-pricing")
  dynamicPricingConfig() {
    return this.mvpCoreService.getDynamicPricingConfig();
  }

  @Post("scale/dynamic-pricing/estimate")
  dynamicPricingEstimate(
    @Body() body: { zone_id: string; base_price: number; hour: number; demand_supply_ratio: number }
  ) {
    return this.mvpCoreService.estimateDynamicPrice(body);
  }

  @Get("scale/ranking")
  rankingConfig() {
    return this.mvpCoreService.getRankingConfig();
  }

  @Put("scale/ranking/:variant")
  setRankingVariant(
    @Param("variant") variant: string,
    @Body()
    body: { rating_weight: number; distance_weight: number; price_weight: number; repeat_weight: number }
  ) {
    return this.mvpCoreService.updateRankingVariant(variant, body);
  }

  @Get("scale/growth-modules")
  growthModules() {
    return this.mvpCoreService.getGrowthModules();
  }

  @Put("scale/growth-modules/:module")
  setGrowthModule(
    @Param("module") module: string,
    @Body() body: { status: "planned" | "pilot" | "active" | "paused"; pilot_zones: string[] }
  ) {
    return this.mvpCoreService.updateGrowthModule({
      module,
      status: body.status,
      pilot_zones: body.pilot_zones
    });
  }

  @Get("scale/payout-governance")
  payoutGovernance() {
    return this.mvpCoreService.getPayoutGovernance();
  }

  @Post("scale/payout-governance/evaluate-risk")
  evaluatePayoutRisk(
    @Body() body: { dispute_rate: number; refund_rate: number; cancellation_rate: number; chargeback_rate: number }
  ) {
    return this.mvpCoreService.evaluatePayoutRisk(body);
  }

  @Get("scale/dispute-automation")
  disputeAutomation() {
    return this.mvpCoreService.getDisputeAutomationConfig();
  }

  @Post("scale/dispute-automation/triage")
  disputeTriage(
    @Body()
    body: {
      dispute_type: string;
      amount: number;
      evidence_score: number;
      evidence_count: number;
      abuse_count_30d: number;
    }
  ) {
    return this.mvpCoreService.triageDispute(body);
  }

  @Get("scale/unit-economics")
  unitEconomics() {
    return this.mvpCoreService.getUnitEconomicsTrend();
  }

  @Get("alerts")
  alerts() {
    return this.dbCoreService.getNotificationFeed("admin");
  }
}
