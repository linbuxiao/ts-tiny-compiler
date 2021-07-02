import transformer from "./transformer";
import tokenizer from "./tokenizer";
import parser from "./parser";
import codeGenerator from "./codeGenerator";

export default function compiler(input: string) {
  let tokens = tokenizer(input);
  let ast = parser(tokens);
  let newAST = transformer(ast);
  let output = codeGenerator(newAST as newAST.all);

  return output;
}
