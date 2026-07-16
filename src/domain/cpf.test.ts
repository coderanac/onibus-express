import { formatCpf, isValidCpf, maskCpfInput, sanitizeCpf } from "./cpf";

describe("isValidCpf", () => {
  it("accepts a valid CPF with punctuation", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("accepts a valid CPF with only digits", () => {
    expect(isValidCpf("52998224725")).toBe(true);
  });

  it("rejects a CPF with an invalid check digit", () => {
    expect(isValidCpf("529.982.247-26")).toBe(false);
  });

  it("rejects a CPF with all repeated digits", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });

  it("rejects a CPF with the wrong number of digits", () => {
    expect(isValidCpf("123456789")).toBe(false);
  });

  it("rejects an empty value", () => {
    expect(isValidCpf("")).toBe(false);
  });
});

describe("formatCpf", () => {
  it("formats digits into the standard CPF mask", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });
});

describe("sanitizeCpf", () => {
  it("removes non digit characters", () => {
    expect(sanitizeCpf("529.982.247-25")).toBe("52998224725");
  });
});

describe("maskCpfInput", () => {
  it("progressively masks digits as the user types", () => {
    expect(maskCpfInput("5")).toBe("5");
    expect(maskCpfInput("529982")).toBe("529.982");
    expect(maskCpfInput("529982247")).toBe("529.982.247");
    expect(maskCpfInput("52998224725")).toBe("529.982.247-25");
  });

  it("ignores non digit characters typed by the user", () => {
    expect(maskCpfInput("529.982.247-25")).toBe("529.982.247-25");
  });

  it("truncates extra digits beyond the CPF length", () => {
    expect(maskCpfInput("529982247259999")).toBe("529.982.247-25");
  });
});
