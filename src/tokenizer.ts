/**
 * 这里tokenizer主要是将输入的语法糖转换成tokens结构{type: 'type', value: 'value'}
 */
import type { tokensType } from "../types";
const input = "(add 2 (subtract 4 2))";

const WIHITE_SPACE_REG = /\s/;
const NUMBER_REG = /[0-9]/;
const LETTERS = /[a-z]/i;

export default function tokenizer(input: string) {
  let current = 0;
  let token: tokensType = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "(") {
      token.push({
        type: "paren",
        value: "(",
      });

      current++;
      continue;
    }

    if (char === ")") {
      token.push({
        type: "paren",
        value: ")",
      });

      current++;
      continue;
    }

    if (WIHITE_SPACE_REG.test(char)) {
      current++;
      continue;
    }

    if (NUMBER_REG.test(char)) {
      let value = "";
      while (NUMBER_REG.test(char)) {
        value = value + char;
        char = input[++current];
      }
      token.push({
        type: "number",
        value,
      });
      continue;
    }

    if (char === '"' || char === "'") {
      let value = "";
      char = input[++current];
      while (char !== '"' && char !== "'") {
        value = value + char;
        char = input[++current];
      }
      char = input[++current];
      token.push({
        type: "string",
        value,
      });
      continue;
    }

    if (LETTERS.test(char)) {
      let value = "";
      while (LETTERS.test(char)) {
        value = value + char;
        char = input[++current];
      }
      token.push({
        type: "name",
        value,
      });
      continue;
    }

    throw new TypeError("I dont know what this character is: " + char);
  }

  return token;
}
