export function money(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}

export function dateBR(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value + "T12:00:00"));
}

export function dateLongBR(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date(value + "T12:00:00"));
}

export function slugify(text: string) {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
