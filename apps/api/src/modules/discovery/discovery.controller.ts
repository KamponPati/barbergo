import { Controller, Get, Param, Query } from "@nestjs/common";
import { DbCoreService } from "../../common/services/db-core.service";

@Controller("discovery")
export class DiscoveryController {
  constructor(private readonly dbCoreService: DbCoreService) {}

  @Get("nearby")
  nearby(
    @Query("zone") zone?: string,
    @Query("min_rating") minRating?: string,
    @Query("service_mode") serviceMode?: "in_shop" | "delivery",
    @Query("q") q?: string,
    @Query("sort") sort?: "rating_desc" | "rating_asc" | "price_asc" | "price_desc"
  ) {
    return this.dbCoreService.listShops({
      zone,
      min_rating: minRating ? Number(minRating) : undefined,
      service_mode: serviceMode,
      q,
      sort
    });
  }

  @Get("shops/:shopId")
  shopDetail(@Param("shopId") shopId: string) {
    return this.dbCoreService.getShopDetail(shopId);
  }

  @Get("shops/:shopId/availability")
  availability(
    @Param("shopId") shopId: string,
    @Query("branch_id") branchId: string,
    @Query("service_id") serviceId: string,
    @Query("date") date: string
  ) {
    return this.dbCoreService.getAvailability({
      shop_id: shopId,
      branch_id: branchId,
      service_id: serviceId,
      date
    });
  }
}
