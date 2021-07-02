/**
 * parser它的主要功能是将tokens转换成ast结构
 */
import type {
  tokensType,
  CallExpression,
  Program,
  StringLiteral,
  NumberLiteral,
} from "../types";

export default function parser(tokens: tokensType) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === "number") {
      current++;

      return {
        type: "NumberLiteral",
        value: token.value,
      } as NumberLiteral;
    }

    if (token.type === "string") {
      current++;

      return {
        type: "StringLiteral",
        value: token.value,
      } as StringLiteral;
    }

    if (token.type == "paren" && token.value === "(") {
      token = tokens[++current];

      let node: CallExpression = {
        type: "CallExpression",
        name: token.value,
        params: [],
      };

      token = tokens[++current];

      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }

    throw new TypeError(token.type);
  }

  let ast: Program = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}
