import splitString from "../src/utils/splitString";

describe("splitString", () => {
  it("should return the input as is when it is less than the max length", () => {
    const input = "Hello, world!";
    const expected = ["Hello, world!"];
    expect(splitString(input)).toEqual(expected);
  });

  it("should split the input into chunks of max length", () => {
    const input = "a".repeat(21);
    const expected = ["a".repeat(20), "a".repeat(1)];
    expect(splitString(input)).toEqual(expected);
  });

  it("should split the input at newline characters", () => {
    const input = "Hello,\nworld!";
    const expected = ["Hello,", "world!"];
    expect(splitString(input)).toEqual(expected);
  });

  it("should split the input into chunks of max length when it contains long words", () => {
    const input = "a".repeat(21) + " " + "b".repeat(21);
    const expected = [
      "a".repeat(20),
      "a".repeat(1) + "b".repeat(20),
      "b".repeat(1),
    ];
    expect(splitString(input)).toEqual(expected);
  });
});
