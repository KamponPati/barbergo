import { Controller, Get } from "@nestjs/common";
import { MvpCoreService } from "../../common/services/mvp-core.service";

@Controller("platform/bookings")
export class BookingPlatformController {
  constructor(private readonly mvpCoreService: MvpCoreService) {}

  @Get("state-machine")
  stateMachine() {
    return {
      transitions: this.mvpCoreService.getBookingStateMachineRules()
    };
  }
}
