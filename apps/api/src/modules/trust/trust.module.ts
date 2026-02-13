import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { TrustController } from "./trust.controller";

@Module({
  imports: [CommonModule],
  controllers: [TrustController]
})
export class TrustModule {}
