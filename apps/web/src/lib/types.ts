export type UserRole = "customer" | "partner" | "admin";

export type Service = {
  id: string;
  name: string;
  price: number;
  duration_minutes?: number;
  mode?: string;
};

export type Branch = {
  id: string;
  name: string;
  zone?: string;
  open_hours?: string;
  capacity?: number;
};

export type Shop = {
  id: string;
  partner_id?: string;
  name: string;
  rating: number;
  services: Service[];
  branches?: Branch[];
  branch_ids?: string[];
};

export type Booking = {
  id: string;
  customer_id?: string;
  partner_id?: string;
  shop_id?: string;
  branch_id?: string;
  service_id?: string;
  status: string;
  amount: number;
  quote_amount?: number;
  slot_at: string;
  payment_id?: string;
  created_at?: string;
  updated_at?: string;
};
