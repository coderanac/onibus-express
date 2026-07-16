const BR_DATE_DIGIT_COUNT = 8;
const BR_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskDateInput(value: string): string {
  const digits = onlyDigits(value).slice(0, BR_DATE_DIGIT_COUNT);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join("/");
}

export function parseBrDateToIso(value: string): string | null {
  const match = BR_DATE_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  const date = new Date(year, month - 1, day);
  const isRealCalendarDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealCalendarDate ? `${yearText}-${monthText}-${dayText}` : null;
}

export function formatIsoToBrDate(value: string): string {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return "";
  }

  const [, yearText, monthText, dayText] = match;
  return `${dayText}/${monthText}/${yearText}`;
}
