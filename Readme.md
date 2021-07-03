# 初衷

为了搞清楚为什么babel可以实现转译的效果，以及AST的生成。我们需要手动实现一个compiler。本文是[tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js)的typescript实现。

当我们输入这样的代码块时

```js
	const input = '(add 2 (subtract 4 2))'
```

它应当被转化为

```js
	const output = 'add(2, subtract(4, 2));'
```

# 实现步骤

1. 进行词法分析，区分出tokens。这时的tokens只作为单个的标识，并不具备语义性。
2. 分析tokens转化为ast结构，此时的ast具备了语义性，但不构成上下文关系。
3. 补充ast的上下文的关系。
   - 遍历旧语法树。对于每种类型分别处理。

## 词法分析

词法分析并不复杂，需要的是将每个字节进行遍历。

这里我们使用了一个指针的概念，通过移动指针获取下一个字节，然后根据字节的种类赋予`type`并且`push`到`tokens`数组中。

复习一下`a++`与`++a`的区别：

- `b = a++`是指a先赋值给b，再自增1。
- `b = ++a`是指a先自增1，再赋值给b。

在for循环中使用`continue`会直接进入下一循环，跳过此循环。

```tsx
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

```

我们会得到一个这样的数组：

```js
[
  { type: "paren", value: "(" },
  { type: "string", value: "add" },
  { type: "number", value: "2" },
  { type: "paren", value: "(" },
  { type: "name", value: "subtract" },
  { type: "number", value: "4" },
  { type: "number", value: "2" },
  { type: "paren", value: ")" },
  { type: "paren", value: ")" },
]
```

我们要书写一个类型去规范这样的数组

```tsx
export type tokensType = Array<tokenType> // tokenType[]

export type tokenType = {
  type: "paren" | "number" | "string" | "name";
  value: string;
}
```

## 转化为AST

这一步我们进行`parse`，也就是把token转化为语法树的过程。

熟悉AST树的小伙伴都会知道，在语法树中的类型都是通过`NumberLiteral`，`StringLiteral`，这种形式显示的。并且每一种不同的类型会拥有不同的属性。

我们这里需要处理的属性有下面几种：

- **NumberLiteral**：字面量。
- **StringLiteral**：字面量。
- **CallExpression**：也就是方法。需要具备名字和参数。
- **Program**：这个是我们指定的根节点，拥有一个数组类型的body。body内是我们的众多节点。

在这里我们还是需要使用上一章的方法，单指针遍历

```tsx
import type { tokensType } from "../types";

export default function parser(tokens: tokensType) {
  // 定义指针
  let current = 0;
  // 定义函数。当我们遇到params时需要进行递归取值。
  function walk() {
    let token = tokens[current];

    if (token.type === "number") {
      current++;

      return {
        type: "NumberLiteral",
        value: token.value,
      } as Ast.NumberLiteral;
    }

    if (token.type === "string") {
      current++;

      return {
        type: "StringLiteral",
        value: token.value,
      } as Ast.StringLiteral;
    }
	
     // 当遇到左括号时，就遇到了CallExpression。下一个节点就是它的名字。
     // 往后直到遇到下一个右括号之前，里面就是params。
    if (token.type == "paren" && token.value === "(") {
      token = tokens[++current];

      let node: Ast.CallExpression = {
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

  let ast: Ast.Program = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}


```

在这里出现了几种ast类型，我们需要进行定义。为了避免和后期的新语法树类型混淆，我们用ts的命名空间进行区分

```tsx
namespace Ast {
  export type CallExpression = {
    type: "CallExpression",
    name: string,
    params: Array<Types>,
  }
  
  export type NumberLiteral = {
    type: "NumberLiteral",
    value: string
  }
  
  export type StringLiteral = {
    type: "StringLiteral",
    value: string
  }
  
  export type Program = {
    type: "Program",
    body: Array<Types>,
  }  
}
```

这时我们将平铺型的token结构转化为了ast的树形结构。

插一嘴，我之前在想，为什么ast是树？后来明白，语法结构它很难不是一棵树。

```js
{
      type: 'Program',
      body: [
        {
          type: 'StringLiteral',
          value: 'string',
        }, 
        {
          type: 'CallExpression',
          name: 'add',
        params: [
          {
            type: 'NumberLiteral',
            value: '2'
          }, 
          {
          type: 'CallExpression',
          name: 'subtract',
          params: [
            {
              type: 'NumberLiteral',
              value: '4'
            }, 
            {
              type: 'NumberLiteral',
              value: '2'
            }
          ]
        }
      ]
      }]
    }
```

## 写一个增强语法树的方法

我们现在的语法树还不够完整，需要写一个方法进入每一层，并且返回操作后的语法树。

```tsx
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

```

这里嵌套了三种方法：

- **traverser**：入口，传入的是`Program`根节点，和`visitor`方法。方法中应当包含相应的ast类型为key的对象，属性要有一个`enter`方法。方法的入参有一个ast节点，类型是key的类型，还有一个parent节点，记录节点的上层对象。（真是抽象，等下看一下类型声明大家就晓得了~）
- **traverseNode**：操作节点的方法。主要任务是调用`enter`，如果是`Program`类型或者`CallExpression`类型则需要向下层遍历。
- **traverseArray**：向下层遍历。

这里需要注意的是类型声明。

首先traverser传入Program节点，这个类型我们声明了。还有一个visitor对象：

```tsx
// visitor的属性均为可选属性，使用Partial包裹。
export type Visitor= Partial<{
  Program?: BindExitAndEnter<Ast.Program>,
  CallExpression?: BindExitAndEnter<Ast.CallExpression>,
  NumberLiteral?: BindExitAndEnter<Ast.NumberLiteral>,
  StringLiteral?: BindExitAndEnter<Ast.StringLiteral>,
}>

// parent可能为null。Program不具备parent节点。
export type ParentTypes = Program | CallExpression | null

// 类型方法。传入一个类型，返回一个对象类型。包括enter和exit方法。但其实这个例子中我们用不到exit方法。
interface BindExitAndEnter<T>{
  enter?: (node: T, parent: Ast.ParentTypes) => void
  exit?: (node: T, parent: Ast.ParentTypes) => void 
} 
```

## 调用方法增强语法树

```tsx
import traverser from "./traverser";

export default function transformer(ast: Ast.Program) {
  // 作为新AST的根节点
  let newAst: Ast.Program = {
    type: "Program",
    body: [],
  };
  // 给旧AST树新增一个context属性，属性内包括它的子集。
  let instance = {
    ...ast,
    _context: newAst.body
  };

  traverser(instance, {
    NumberLiteral: {
      enter(node, parent: Ast.ParentTypes) {
        // 在父级上下文中传入自己
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

        parent?._context?.push(expression);
      },
    },
  });

  return {
    ...newAst,
    body: instance._context, // 最终所有记录在父级上下文中的内容都存在于instance._context中
  };
}

```

在这里我们新增了一个_context作为指向下级节点的指针，穿针引线，记录所有，最后赋值给新AST的body。

此时我们会得到一个更健壮的语法树：

```tsx
{
      type: 'Program',
      body: [
        {
          type: 'StringLiteral',
          value: '1'
        },
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'add'
            },
            arguments: [
              {
                type: 'NumberLiteral',
                value: '2'
              }, 
              {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'subtract'
              },
              arguments: [
                {
                  type: 'NumberLiteral',
                  value: '4'
                }, 
                {
                  type: 'NumberLiteral',
                  value: '2'
                }
              ]
            }
          ]
        }
      }]
    }
```

我们甚至拥有了作用域！一个好的开始。但是ast的类型也发生了改变。所以我们需要定义新的类型：

```tsx
namespace newAST {
  export type Program = {
    type: "Program",
    body: withoutProgram[]
  }

  export type ExpressionStatement = {
    type: "ExpressionStatement",
    expression: CallExpression
  }

  export type CallExpression = {
    type: "CallExpression",
    callee: Identifier,
    arguments: withoutProgram[]
  }

  export type NumberLiteral = {
    type: "NumberLiteral",
    value: string
  }

  export type StringLiteral = {
    type: "StringLiteral",
    value: string
  }

  type Identifier = {
    type: "Identifier",
    name: string
  }

  export type withoutProgram = ExpressionStatement | CallExpression | NumberLiteral | StringLiteral | Identifier

  export type all = withoutProgram | Program
}
```

## 将新语法树转化为代码

有了新的语法树，我们终于可以把代码转化为人为可读的代码！

```tsx
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
```

现在当我们输入

```tsx
"'abcd'(add 2 (subtract 4 2))"
```

会得到

```jsx
'"abcd"\nadd(2,subtract(4,2));' // \n是一个换行
```

## 测试

对于这类工具，一步一测是很有必要的。不过因为测试篇幅过长，就不在这里放置了~

大家可以去仓库查看

# 参考

the-super-tiny-compiler): https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js

本文代码仓库：https://github.com/linbuxiao/ts-tiny-compiler

谢谢大家！