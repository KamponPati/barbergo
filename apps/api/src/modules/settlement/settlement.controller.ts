import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MvpCoreService } from "../../common/services/mvp-core.service";

@Controller("partner/wallet")
export class SettlementController {
  constructor(private readonly mvpCoreService: MvpCoreService) {}

  @Get(":partnerId")
  summary(@Param("partnerId") partnerId: string) {
    return this.mvpCoreService.getWalletSummary(partnerId);
  }

  @Post(":partnerId/withdraw")
  withdraw(@Param("partnerId") partnerId: string, @Body() body: { amount: number }) {
    return this.mvpCoreService.requestWithdrawal(partnerId, body.amount);
  }
}
