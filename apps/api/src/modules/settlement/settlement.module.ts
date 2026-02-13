import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { SettlementController } from "./settlement.controller";

@Module({
  imports: [CommonModule],
  controllers: [SettlementController]
})
export class SettlementModule {}
