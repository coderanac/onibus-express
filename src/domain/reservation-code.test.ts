import {
  generateReservationCode,
  isValidReservationCodeFormat,
} from "./reservation-code";

describe("generateReservationCode", () => {
  it("generates a code in the AAA-99999 format", () => {
    const code = generateReservationCode();
    expect(isValidReservationCodeFormat(code)).toBe(true);
  });

  it("generates codes that are reasonably unique across many calls", () => {
    const codes = new Set(
      Array.from({ length: 500 }, () => generateReservationCode()),
    );
    expect(codes.size).toBeGreaterThan(490);
  });
});

describe("isValidReservationCodeFormat", () => {
  it("rejects codes that do not match the expected pattern", () => {
    expect(isValidReservationCodeFormat("abc-12345")).toBe(false);
    expect(isValidReservationCodeFormat("AB-12345")).toBe(false);
    expect(isValidReservationCodeFormat("ABC-1234")).toBe(false);
    expect(isValidReservationCodeFormat("ABC12345")).toBe(false);
  });
});
