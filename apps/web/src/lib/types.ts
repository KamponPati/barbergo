export type UserRole = "customer" | "partner" | "admin";

export type Shop = {
  id: string;
  name: string;
  rating: number;
  services: Array<{ id: string; name: string; price: number }>;
};

export type Booking = {
  id: string;
  status: string;
  amount: number;
  slot_at: string;
};
