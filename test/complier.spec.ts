import compiler from "../src/index"

describe("compiler", ()=> {
  test("should return string", ()=> {
    expect(compiler("'abcd'(add 2 (subtract 4 2))")).toStrictEqual('"abcd"\nadd(2,subtract(4,2));')
  })
})