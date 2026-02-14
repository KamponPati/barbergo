import { Controller, Get } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { join } from "node:path";

@Controller("health")
export class HealthController {
  @Get("live")
  getLive(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
  getReady(): { status: string; version?: string } {
    let version: string | undefined;
    try {
      version = readFileSync(join(process.cwd(), "VERSION"), "utf8").trim();
    } catch {
      version = process.env.APP_VERSION;
    }

    return version && version.length > 0 ? { status: "ready", version } : { status: "ready" };
  }
}
