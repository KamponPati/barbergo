import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { AuthModule } from "../auth/auth.module";
import { AdminController } from "./admin.controller";

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [AdminController]
})
export class AdminModule {}
