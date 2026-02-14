import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { CommonModule } from "../../common/common.module";
import { AuthController } from "./auth.controller";
import { AuthService, AUTH_REPO_TOKEN } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PrismaAuthRepo } from "./auth.repo";

@Module({
  imports: [
    CommonModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "change-me",
      signOptions: { expiresIn: "1h" }
    })
  ],
  controllers: [AuthController],
  providers: [
    PrismaAuthRepo,
    {
      provide: AUTH_REPO_TOKEN,
      useExisting: PrismaAuthRepo
    },
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard]
})
export class AuthModule {}
