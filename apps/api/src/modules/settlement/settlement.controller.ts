import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("partner/wallet")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("partner")
export class SettlementController {
  constructor(private readonly dbCoreService: DbCoreService) {}

  @Get(":partnerId")
  summary(@CurrentUser() user: CurrentUserPayload, @Param("partnerId") partnerId: string) {
    if (partnerId !== user.user_id) {
      throw new ForbiddenException({ code: "PARTNER_FORBIDDEN", message: "cannot access another partner wallet" });
    }
    return this.dbCoreService.getWalletSummary(user.user_id);
  }

  @Post(":partnerId/withdraw")
  withdraw(@CurrentUser() user: CurrentUserPayload, @Param("partnerId") partnerId: string, @Body() body: { amount: number }) {
    if (partnerId !== user.user_id) {
      throw new ForbiddenException({ code: "PARTNER_FORBIDDEN", message: "cannot access another partner wallet" });
    }
    return this.dbCoreService.requestWithdrawal(user.user_id, body.amount);
  }
}
