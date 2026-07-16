import { formatIsoToBrDate, maskDateInput, parseBrDateToIso } from "./date";

describe("maskDateInput", () => {
  it("progressively inserts slashes as digits are typed", () => {
    expect(maskDateInput("0")).toBe("0");
    expect(maskDateInput("01")).toBe("01");
    expect(maskDateInput("010")).toBe("01/0");
    expect(maskDateInput("01011990")).toBe("01/01/1990");
  });

  it("strips non-digit characters before masking", () => {
    expect(maskDateInput("01/01/1990")).toBe("01/01/1990");
  });

  it("ignores digits beyond dd/mm/aaaa", () => {
    expect(maskDateInput("010119901234")).toBe("01/01/1990");
  });
});

describe("parseBrDateToIso", () => {
  it("converts a valid dd/mm/aaaa date to aaaa-mm-dd", () => {
    expect(parseBrDateToIso("01/01/1990")).toBe("1990-01-01");
    expect(parseBrDateToIso("29/02/2020")).toBe("2020-02-29");
  });

  it("rejects an incomplete date", () => {
    expect(parseBrDateToIso("01/01")).toBeNull();
    expect(parseBrDateToIso("")).toBeNull();
  });

  it("rejects a calendar date that does not exist", () => {
    expect(parseBrDateToIso("31/02/2020")).toBeNull();
    expect(parseBrDateToIso("29/02/2021")).toBeNull();
  });
});

describe("formatIsoToBrDate", () => {
  it("converts an aaaa-mm-dd date to dd/mm/aaaa", () => {
    expect(formatIsoToBrDate("1990-01-01")).toBe("01/01/1990");
    expect(formatIsoToBrDate("2020-02-29")).toBe("29/02/2020");
  });

  it("returns an empty string for an invalid or empty value", () => {
    expect(formatIsoToBrDate("")).toBe("");
    expect(formatIsoToBrDate("not-a-date")).toBe("");
  });
});
