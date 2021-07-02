/**
 * 最后是遍历新的newAst，将递归处理里面的类型，并转换成最后机器等能识别或期望的类型结果
 */

export default function codeGenerator(node: newAST.all): string {
  switch (node.type) {
    case "Program": {
      return node.body.map(codeGenerator).join("\n");
    }

    case "ExpressionStatement": {
      return codeGenerator(node.expression) + ";";
    }

    case "CallExpression": {
      return (
        codeGenerator(node.callee) +
        "(" +
        node.arguments.map(codeGenerator).join(",") +
        ")"
      );
    }

    case "Identifier": {
      return node.name;
    }

    case "NumberLiteral": {
      return node.value;
    }

    case "StringLiteral": {
      return '"' + node.value + '"';
    }
  }
}
