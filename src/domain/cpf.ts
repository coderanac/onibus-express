const CPF_LENGTH = 11;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function hasAllSameDigits(digits: string): boolean {
  return digits.split("").every((digit) => digit === digits[0]);
}

function calculateCheckDigit(digits: string, factor: number): number {
  let total = 0;
  for (const digit of digits) {
    total += Number(digit) * factor;
    factor -= 1;
  }
  const remainder = total % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== CPF_LENGTH || hasAllSameDigits(digits)) {
    return false;
  }

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 9), 10);
  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 10), 11);

  return (
    firstCheckDigit === Number(digits[9]) &&
    secondCheckDigit === Number(digits[10])
  );
}

export function formatCpf(value: string): string {
  const digits = onlyDigits(value);
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function sanitizeCpf(value: string): string {
  return onlyDigits(value);
}

export function maskCpfInput(value: string): string {
  const digits = onlyDigits(value).slice(0, CPF_LENGTH);
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(
    Boolean,
  );
  const checkDigits = digits.slice(9, 11);

  let masked = groups.join(".");
  if (checkDigits) {
    masked += `-${checkDigits}`;
  }
  return masked;
}
