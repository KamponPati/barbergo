import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./guards/roles.guard";
import { CurrentUser, CurrentUserPayload } from "./current-user.decorator";

type LoginRequest = {
  user_id: string;
  role: string;
};

type RefreshRequest = {
  refresh_token?: string;
};

@Controller("auth")
export class AuthController {
  private readonly refreshCookieName = "bg_refresh_token";

  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginRequest
  ): { access_token: string; expires_in_seconds: number } {
    const issued = this.authService.issueToken(body.user_id, body.role, {
      ip: req.ip,
      user_agent: req.header("user-agent")
    });
    this.setRefreshCookie(res, issued.refresh_token, issued.refresh_expires_in_seconds);
    return {
      access_token: issued.access_token,
      expires_in_seconds: issued.expires_in_seconds
    };
  }

  @Post("refresh")
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshRequest
  ): { access_token: string; expires_in_seconds: number } {
    const refreshToken = this.getRefreshToken(req, body);
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: "AUTH_REFRESH_MISSING",
        message: "refresh token is required"
      });
    }

    const issued = this.authService.rotateRefreshToken(refreshToken, {
      ip: req.ip,
      user_agent: req.header("user-agent")
    });
    this.setRefreshCookie(res, issued.refresh_token, issued.refresh_expires_in_seconds);
    return {
      access_token: issued.access_token,
      expires_in_seconds: issued.expires_in_seconds
    };
  }

  @Post("logout")
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshRequest
  ): { revoked: boolean } {
    const refreshToken = this.getRefreshToken(req, body);
    if (!refreshToken) {
      this.clearRefreshCookie(res);
      return { revoked: false };
    }
    const result = this.authService.revokeByRefreshToken(refreshToken);
    this.clearRefreshCookie(res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout-all")
  logoutAll(@CurrentUser() user: CurrentUserPayload): { revoked_count: number } {
    return this.authService.revokeAllByUser(user.user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: CurrentUserPayload): CurrentUserPayload {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get("admin-only")
  adminOnly(@CurrentUser() user: CurrentUserPayload): { ok: boolean; user_id: string } {
    return { ok: true, user_id: user.user_id };
  }

  private getRefreshToken(req: Request, body: RefreshRequest): string | null {
    const cookieHeader = req.header("cookie");
    if (cookieHeader) {
      const token = cookieHeader
        .split(";")
        .map((entry) => entry.trim())
        .find((entry) => entry.startsWith(`${this.refreshCookieName}=`))
        ?.slice(`${this.refreshCookieName}=`.length);
      if (token) {
        return decodeURIComponent(token);
      }
    }
    return body.refresh_token ?? null;
  }

  private setRefreshCookie(res: Response, token: string, ttlSeconds: number): void {
    const secureDefault = process.env.NODE_ENV === "production";
    const secure = (process.env.AUTH_COOKIE_SECURE ?? String(secureDefault)) === "true";
    res.cookie(this.refreshCookieName, token, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: ttlSeconds * 1000
    });
  }

  private clearRefreshCookie(res: Response): void {
    const secureDefault = process.env.NODE_ENV === "production";
    const secure = (process.env.AUTH_COOKIE_SECURE ?? String(secureDefault)) === "true";
    res.clearCookie(this.refreshCookieName, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/api/v1/auth"
    });
  }
}
