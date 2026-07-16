const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "0123456789";

function randomChar(alphabet: string): string {
  const index = Math.floor(Math.random() * alphabet.length);
  return alphabet[index];
}

function randomSequence(length: number, alphabet: string): string {
  return Array.from({ length }, () => randomChar(alphabet)).join("");
}

export function generateReservationCode(): string {
  return `${randomSequence(3, LETTERS)}-${randomSequence(5, DIGITS)}`;
}

export function isValidReservationCodeFormat(code: string): boolean {
  return /^[A-Z]{3}-\d{5}$/.test(code);
}
