export type Establishment = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_url: string | null;
  segment: string | null;
  plan: string;
  plan_status?: string;
  plan_renews_at?: string | null;
  whatsapp_notify?: boolean;
};

export type Service = {
  id: string;
  establishment_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  active: boolean;
};

export type Professional = {
  id: string;
  establishment_id: string;
  name: string;
  specialty: string | null;
  photo_url: string | null;
  phone: string | null;
  active: boolean;
};

export type Customer = {
  id: string;
  establishment_id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
};

export type Appointment = {
  id: string;
  establishment_id: string;
  customer_id: string;
  professional_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  notes: string | null;
  customers?: { name: string; phone: string };
  professionals?: { name: string };
  services?: { name: string; duration_minutes: number };
};

export type BusinessHour = {
  id: string;
  establishment_id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
  break_start: string | null;
  break_end: string | null;
};

export type CustomerAppointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  service_name: string;
  professional_name: string;
};

export const PLAN_LABELS: Record<string, string> = {
  free: "Grátis",
  profissional: "Profissional",
  studio: "Studio",
};
