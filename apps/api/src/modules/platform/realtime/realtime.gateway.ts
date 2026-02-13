import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  namespace: "/realtime",
  cors: {
    origin: "*"
  }
})
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  emitTimeline(eventName: string, payload: Record<string, unknown>): void {
    this.server.emit(eventName, payload);
  }
}
