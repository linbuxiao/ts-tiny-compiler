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