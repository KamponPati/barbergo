import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";

@Controller("partner/wallet")
export class SettlementController {
  constructor(private readonly dbCoreService: DbCoreService) {}

  @Get(":partnerId")
  summary(@Param("partnerId") partnerId: string) {
    return this.dbCoreService.getWalletSummary(partnerId);
  }

  @Post(":partnerId/withdraw")
  withdraw(@Param("partnerId") partnerId: string, @Body() body: { amount: number }) {
    return this.dbCoreService.requestWithdrawal(partnerId, body.amount);
  }
}
