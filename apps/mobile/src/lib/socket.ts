import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";

// Strip /api/v1 suffix to get the base server URL for Socket.IO
const WS_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

let _socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (_socket?.connected) return _socket;

  _socket = io(WS_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  return _socket;
}

export function disconnectSocket() {
  _socket?.disconnect();
  _socket = null;
}

// ─── Booking event types ──────────────────────────────────────────────────────
export type BookingEvent =
  | "booking_confirmed"
  | "service_started"
  | "service_completed"
  | "booking_cancelled";

export interface BookingEventPayload {
  booking_id: string;
  status:     string;
  slot_at?:   string;
}

/**
 * Subscribe to real-time booking events for a customer.
 * Returns an unsubscribe function to call on component unmount.
 */
export function subscribeToBookingEvents(
  token: string,
  bookingId: string,
  onEvent: (event: BookingEvent, payload: BookingEventPayload) => void
): () => void {
  const socket = getSocket(token);

  const events: BookingEvent[] = [
    "booking_confirmed",
    "service_started",
    "service_completed",
    "booking_cancelled",
  ];

  const handlers: Array<[BookingEvent, (payload: BookingEventPayload) => void]> = events.map(
    (evt) => {
      const handler = (payload: BookingEventPayload) => {
        if (payload.booking_id === bookingId) {
          onEvent(evt, payload);
        }
      };
      socket.on(evt, handler);
      return [evt, handler];
    }
  );

  // Join the booking room
  socket.emit("join_booking", { booking_id: bookingId });

  return () => {
    handlers.forEach(([evt, handler]) => socket.off(evt, handler));
    socket.emit("leave_booking", { booking_id: bookingId });
  };
}

/**
 * Subscribe to partner-side events (new booking requests).
 * Returns an unsubscribe function.
 */
export function subscribeToPartnerEvents(
  token: string,
  partnerId: string,
  onNewBooking: (payload: BookingEventPayload) => void
): () => void {
  const socket = getSocket(token);

  socket.emit("join_partner", { partner_id: partnerId });

  const handler = (payload: BookingEventPayload) => onNewBooking(payload);
  socket.on("booking_request", handler);

  return () => {
    socket.off("booking_request", handler);
    socket.emit("leave_partner", { partner_id: partnerId });
  };
}
