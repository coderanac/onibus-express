export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function splitCurrencyParts(value: number): { reais: string; centavos: string } {
  const [reais, centavos] = value.toFixed(2).split(".");
  return { reais, centavos };
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
    new Date(isoDate),
  );
}

export function formatTime(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(
    new Date(isoDate),
  );
}

export function formatDateTime(isoDate: string): string {
  return `${formatDate(isoDate)} às ${formatTime(isoDate)}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${remainingMinutes.toString().padStart(2, "0")}`;
}
