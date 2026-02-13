import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { DiscoveryController } from "./discovery.controller";

@Module({
  imports: [CommonModule],
  controllers: [DiscoveryController]
})
export class DiscoveryModule {}
