import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MinioService } from "../../common/services/minio.service";
import { DbCoreService } from "../../common/services/db-core.service";

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

  @Post("partner/onboarding/:partnerId/documents")
  uploadDocument(
    @Param("partnerId") partnerId: string,
    @Body() body: { type: string; url: string }
  ) {
    return this.dbCoreService.uploadPartnerDocument({
      partner_id: partnerId,
      type: body.type,
      url: body.url
    });
  }

  @Post("partner/onboarding/:partnerId/documents/presign-upload")
  async presignUpload(
    @Param("partnerId") partnerId: string,
    @Body() body: { type: string; filename: string }
  ) {
    const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!safeName) {
      throw new BadRequestException({ code: "INVALID_FILENAME", message: "filename is invalid" });
    }

    const objectKey = `kyc/${partnerId}/${body.type}/${Date.now()}_${safeName}`;
    return this.minioService.getPresignedUploadUrl(objectKey);
  }

  @Post("partner/onboarding/:partnerId/documents/presign-download")
  async presignDownload(
    @Param("partnerId") partnerId: string,
    @Body() body: { type: string; filename: string; timestamp: number }
  ) {
    const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!safeName) {
      throw new BadRequestException({ code: "INVALID_FILENAME", message: "filename is invalid" });
    }

    const objectKey = `kyc/${partnerId}/${body.type}/${body.timestamp}_${safeName}`;
    return this.minioService.getPresignedDownloadUrl(objectKey);
  }

  @Get("partner/onboarding/:partnerId/status")
  onboardingStatus(@Param("partnerId") partnerId: string) {
    return this.dbCoreService.getPartnerVerificationStatus(partnerId);
  }

  @Post("partner/branches")
  upsertBranch(
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
    return this.dbCoreService.upsertBranch(body);
  }

  @Post("partner/services")
  upsertService(
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
    return this.dbCoreService.upsertService(body);
  }

  @Post("partner/staff")
  upsertStaff(
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
    return this.dbCoreService.upsertStaff(body);
  }

  @Post("disputes")
  createDispute(
    @Body()
    body: {
      booking_id: string;
      created_by: string;
      reason: string;
      evidence_note: string;
    }
  ) {
    return this.dbCoreService.createDispute(body);
  }
}
