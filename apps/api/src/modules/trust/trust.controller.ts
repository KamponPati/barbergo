import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MinioService } from "../../common/services/minio.service";
import { DbCoreService } from "../../common/services/db-core.service";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller()
export class TrustController {
  constructor(
    private readonly dbCoreService: DbCoreService,
    private readonly minioService: MinioService
  ) {}

  @Post("partner/onboarding")
  onboarding(@Body() body: { partner_name: string }) {
    return this.dbCoreService.submitPartnerOnboarding(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("partner")
  @Post("partner/onboarding/:partnerId/documents")
  uploadDocument(
    @CurrentUser() user: CurrentUserPayload,
    @Param("partnerId") partnerId: string,
    @Body() body: { type: string; url: string }
  ) {
    if (partnerId !== user.user_id) {
      throw new ForbiddenException({ code: "PARTNER_FORBIDDEN", message: "cannot upload for another partner" });
    }
    return this.dbCoreService.uploadPartnerDocument({
      partner_id: user.user_id,
      type: body.type,
      url: body.url
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("partner")
  @Post("partner/onboarding/:partnerId/documents/presign-upload")
  async presignUpload(
    @CurrentUser() user: CurrentUserPayload,
    @Param("partnerId") partnerId: string,
    @Body() body: { type: string; filename: string }
  ) {
    if (partnerId !== user.user_id) {
      throw new ForbiddenException({ code: "PARTNER_FORBIDDEN", message: "cannot upload for another partner" });
    }
    const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!safeName) {
      throw new BadRequestException({ code: "INVALID_FILENAME", message: "filename is invalid" });
    }

    const objectKey = `kyc/${partnerId}/${body.type}/${Date.now()}_${safeName}`;
    return this.minioService.getPresignedUploadUrl(objectKey);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("partner")
  @Post("partner/onboarding/:partnerId/documents/presign-download")
  async presignDownload(
    @CurrentUser() user: CurrentUserPayload,
    @Param("partnerId") partnerId: string,
    @Body() body: { type: string; filename: string; timestamp: number }
  ) {
    if (partnerId !== user.user_id) {
      throw new ForbiddenException({ code: "PARTNER_FORBIDDEN", message: "cannot download for another partner" });
    }
    const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!safeName) {
      throw new BadRequestException({ code: "INVALID_FILENAME", message: "filename is invalid" });
    }

    const objectKey = `kyc/${partnerId}/${body.type}/${body.timestamp}_${safeName}`;
    return this.minioService.getPresignedDownloadUrl(objectKey);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("partner")
  @Get("partner/onboarding/:partnerId/status")
  onboardingStatus(@CurrentUser() user: CurrentUserPayload, @Param("partnerId") partnerId: string) {
    if (partnerId !== user.user_id) {
      throw new ForbiddenException({ code: "PARTNER_FORBIDDEN", message: "cannot access another partner" });
    }
    return this.dbCoreService.getPartnerVerificationStatus(user.user_id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("partner")
  @Post("partner/branches")
  upsertBranch(
    @CurrentUser() user: CurrentUserPayload,
    @Body()
    body: {
      partner_id: string;
      branch_id?: string;
      shop_id: string;
      name: string;
      zone: string;
      open_hours: string;
      capacity: number;
      lat: number;
      lng: number;
    }
  ) {
    return this.dbCoreService.upsertBranch({ ...body, partner_id: user.user_id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("partner")
  @Post("partner/services")
  upsertService(
    @CurrentUser() user: CurrentUserPayload,
    @Body()
    body: {
      partner_id: string;
      shop_id: string;
      service_id?: string;
      name: string;
      price: number;
      duration_minutes: number;
      mode: "in_shop" | "delivery";
    }
  ) {
    return this.dbCoreService.upsertService({ ...body, partner_id: user.user_id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("partner")
  @Post("partner/staff")
  upsertStaff(
    @CurrentUser() user: CurrentUserPayload,
    @Body()
    body: {
      partner_id: string;
      shop_id: string;
      staff_id?: string;
      name: string;
      skills: string[];
      shift_slots: string[];
    }
  ) {
    return this.dbCoreService.upsertStaff({ ...body, partner_id: user.user_id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("customer")
  @Post("disputes")
  createDispute(
    @CurrentUser() user: CurrentUserPayload,
    @Body()
    body: {
      booking_id: string;
      created_by: string;
      reason: string;
      evidence_note: string;
    }
  ) {
    return this.dbCoreService.createDispute({ ...body, created_by: user.user_id });
  }
}
