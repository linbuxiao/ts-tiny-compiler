import traverser from "./traverser";

export default function transformer(ast: Ast.Program) {
  let newAst: Ast.Program = {
    type: "Program",
    body: [],
  };

  let instance = {
    ...ast,
    _context: newAst.body,
  };

  traverser(instance, {
    NumberLiteral: {
      enter(node, parent: Ast.ParentTypes) {
        parent?._context?.push({
          type: "NumberLiteral",
          value: node.value,
        });
      },
    },

    StringLiteral: {
      enter(node, parent) {
        parent?._context?.push({
          type: "StringLiteral",
          value: node.value,
        });
      },
    },

    CallExpression: {
      enter(node, parent) {
        // 添加callee记录name/type

        let expression: any = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: node.name,
          },
          arguments: [],
        };

        node._context = expression.arguments;

        if (parent?.type !== "CallExpression") {
          // 添加type，创建作用域

          expression = {
            type: "ExpressionStatement",
            expression,
          };
        }

        parent?._context.push(expression);
      },
    },
  });

  return {
    ...newAst,
    body: instance._context,
  };
}
