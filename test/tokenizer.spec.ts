import tokenizer from "../src/tokenizer";

describe("tokenizer", () => {
  test("should return object", () => {
    expect(tokenizer("('add' 2 (subtract 4 2))")).toEqual([
      { type: "paren", value: "(" },
      { type: "string", value: "add" },
      { type: "number", value: "2" },
      { type: "paren", value: "(" },
      { type: "name", value: "subtract" },
      { type: "number", value: "4" },
      { type: "number", value: "2" },
      { type: "paren", value: ")" },
      { type: "paren", value: ")" },
    ]);
  });

  test("should return Error", () => {
    expect(() => tokenizer("@")).toThrow(
      TypeError("I dont know what this character is: @")
    );
  });
});
