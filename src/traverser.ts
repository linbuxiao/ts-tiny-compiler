import type { Visitor } from "../types";

/**
 * traverser方法主要是对旧ast进行遍历，根据相应的type执行visitor传过来的enter方法
 */
export default function traverser(ast: Ast.Program, visitor: Visitor) {
  // 对array数组依次执行traversNode方法
  function traverseArray(array: Array<Ast.Types>, parent: Ast.ParentTypes) {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node: Ast.TypesWithProgram, parent: Ast.ParentTypes) {
    // method主要获取visitor对应type的方法
    let methods = visitor[node.type];

    // 执行methods方法
    if (methods && methods.enter) {
      methods.enter(node as any, parent);
    }
    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;
      case "CallExpression":
        traverseArray(node.params, node);
        break;
      case "NumberLiteral":
      case "StringLiteral":
        break;
    }

    // if(methods && methods.exit) {
    //   methods.exit(node as any, parent)
    // }
  }

  traverseNode(ast, null);

  return ast;
}
